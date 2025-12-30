import cloudinary from "../config/cloudinary.js";
import { Product } from "../models/product.model.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";

export const createProduct = async (req, res) => {
  const { name, description, price, stock, category } = req.body;

  try {
    if (!name || !description || !price || !stock || !category) {
      return res.status(400).json({ message: "all field are required" });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "Atleast one image are required" });
    }

    if (req.files.length > 3) {
      return res.status(400).json({ message: "maximum 3 image are allowed" });
    }

    const uploadPromises = req.files.map((file) => {
      return cloudinary.uploader.upload(file.path, {
        folder: "Products",
      });
    });

    const uploadResults = await Promise.all(uploadPromises);
    // secure url

    const imageUrls = uploadResults.map((result) => result.secure_url);

    // create products
    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      category,
      images: imageUrls,
    });

    res.status(201).json(product);
  } catch (error) {
    console.log("Error creating product", error.message);
    res.status(500).json({ message: "internal server error" });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    // -1 means descending order (latest products first)
    const products = await Product.find().sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    console.log("error fetching products", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, description, category } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (name) product.name = name;
    if (price != undefined) product.price = parseFloat(price);
    if (description) product.description = description;
    if (stock != undefined) product.stock = parseInt(stock);
    if (category) product.category = category;

    // handle image upload if ne image is uploaded

    if (req.files && req.files.length > 0) {
      if (req.files.length > 3) {
        return res
          .status(400)
          .json({ message: "maximum 3 images are allowed" });
      }

      const uploadPromises = req.files.map((file) => {
        return cloudinary.uploader.upload(file.path, {
          folder: "Products",
        });
      });

      const uploadResults = await Promise.all(uploadPromises);
      product.images = uploadResults.map((result) => result.secure_url);
    }

    await product.save();
    res.status(200).json(product);
  } catch (error) {
    console.log("error fetching products", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("orderItems.product");
    res.status(200).json({ orders });
  } catch (error) {
    console.log("Errors in get all products controllers");
    res.status(500).json({ error: "Internal server error" });
  }
};
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Debug: log incoming body to help diagnose client issues
    console.log("updateOrderStatus - orderId:", orderId, "body:", req.body);

    // Extra debug: show typeof and character codes to catch hidden chars
    try {
      console.log("status value:", status);
      console.log("status typeof:", typeof status);
      if (typeof status === "string") {
        console.log(
          "status charCodes:",
          status.split("").map((c) => c.charCodeAt(0))
        );
      }
    } catch (logErr) {
      console.log("Error logging status details:", logErr);
    }

    if (status === undefined || status === null) {
      return res.status(400).json({ error: "status is required in request body" });
    }

    // normalize status: accept strings with extra spaces or different case
    let normalizedStatus = status;
    if (typeof normalizedStatus !== "string") {
      try {
        normalizedStatus = String(normalizedStatus);
      } catch (e) {
        return res.status(400).json({ error: "invalid status type" });
      }
    }
    normalizedStatus = normalizedStatus.trim().toLowerCase();

    const allowed = ["pending", "shipped", "delivered"];
    if (!allowed.includes(normalizedStatus)) {
      return res.status(400).json({ error: `invalid status. allowed: ${allowed.join(", ")}` });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;

    // 2. Ensure consistency here as well
    if (order.status === "shipped" && !order.shippedAt) {
      order.shippedAt = new Date();
    }
    if (order.status === "delivered" && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    // 3. MUST AWAIT SAVE
    await order.save(); 

    res.status(200).json({ message: "Order status updated successfully", order });
  } catch (error) {
    console.error("Error in updateOrderStatus controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find().sort({ createdAt: -1 }); // latest user first
    res.status(200).json({ customers });
  } catch (error) {
    console.error("Error fetching customers controller", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const getDashboardStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const revenueResult = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const totalCustomers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();

    res.status(200).json({
      totalRevenue,
      totalCustomers,
      totalProducts,
      totalOrders,
    });
  } catch (error) {
    console.error("error getting total stats in controller ", error.message);
    res.status(500).json({ error: "internal server error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map((imageUrl) => {
        // Extract public_id from URL (assumes format: .../products/publicId.ext)
        const publicId =
          "Products/" + imageUrl.split("/Products/")[1]?.split(".")[0];
        if (publicId) return cloudinary.uploader.destroy(publicId);
      });
      await Promise.all(deletePromises.filter(Boolean));
    }

    await Product.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Errore in deletProduct controller", error.message);
    res.status(500).json({ message: "internal server error" });
  }
};
