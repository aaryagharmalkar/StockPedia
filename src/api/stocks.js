import axios from "axios";

const API_URL = "http://localhost:5000/api/stocks";

export const getLiveStocks = async () => {
  const { data } = await axios.get(`${API_URL}/live`);
  return data;
};
