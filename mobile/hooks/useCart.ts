import { useApi } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Cart } from "../types/index";

const useCart = () => {

    const api = useApi();
    const queryClient = useQueryClient();


    const {data:cart,isLoading,isError} = useQuery({
        queryKey:["cart"],
        queryFn:async()=>{
            const {data} = await api.get<{cart: Cart}>("/cart");
            return data.cart
        }
    })

    const addToCartMutation = useMutation({
        mutationFn: async ({productId,quantity = 1,}: {productId: string;quantity?: number;}) => {
            const { data } = await api.post<{ cart: Cart }>("/cart", {productId,quantity,});
            return data.cart;
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cart"] }),
    });

    const updateProductQuantityMutation = useMutation({
        mutationFn:async({productId,quantity}:{productId:string,quantity:number})=>{
            const {data} = await api.put<{cart:Cart}>(`/cart/${productId}`,{quantity});
            return data.cart;
        },
        onSuccess:()=>{
            queryClient.invalidateQueries({queryKey:["cart"]});
        },
    });

    const removeFromCartMutation = useMutation({
        mutationFn:async(productId:string)=>{
            const {data} = await api.delete<{cart:Cart}>(`/cart/${productId}`);
            return data.cart;
        },
        onSuccess:()=> queryClient.invalidateQueries({queryKey:["cart"]}),
    });

    const clearCartMutation = useMutation({
        mutationFn:async () => {
            const {data} = await api.delete<{cart:Cart}>("/cart");
            return data.cart;
        },
        onSuccess:()=>queryClient.invalidateQueries({queryKey:["cart"]}),
    });

    const cartTotal =
    cart?.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) ?? 0;

    const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

    

    return {
        addToCart: addToCartMutation.mutate,
        isAddingToCart : addToCartMutation.isPending,
        cart,
        isLoading,
        isError,
        cartTotal,
        cartItemCount,
        updateQuantity: updateProductQuantityMutation.mutate,
        removeFromCart: removeFromCartMutation.mutate,
        clearCart: clearCartMutation.mutate,
        isUpdating: updateProductQuantityMutation.isPending,
        isRemoving: removeFromCartMutation.isPending,
        isClearing: clearCartMutation.isPending,
    };
};

export default useCart;
