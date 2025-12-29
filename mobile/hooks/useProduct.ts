import { useApi } from "@/lib/api"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Product } from "@/types"

const useProduct = (productId:string) => {
    const api = useApi();
    const result = useQuery({
        queryKey:["product",productId],
        queryFn:async()=>{
            const {data} = await api.get(`/products/${productId}`);
            return data;
        },
        enabled: !!productId
    })
  return result
}

export default useProduct