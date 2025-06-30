import axios from 'axios';
import { backendUrl } from '../App';

const commissionService = {

    getCategories: async () => {
        try {
            const response = await axios.get(backendUrl + `/api/categories`);
            return response.data;
        } catch (error) {
            throw error.response ? error.response.data : error;
        }
    }


}

export default commissionService;