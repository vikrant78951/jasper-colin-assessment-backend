export const getProducts = (req, res) => {
  res.status(200).json({ message: "Products fetched successfully" });
};

export const getProductById = (req, res) => {
  res.status(200).json({ message: "Product fetched successfully" });
};

export const createProduct = (req, res) => {
  res.status(200).json({ message: "Product created successfully" });
};

export const updateProduct = (req, res) => {
  res.status(200).json({ message: "Product updated successfully" });
};

export const deleteProduct = (req, res) => {
  res.status(200).json({ message: "Product deleted successfully" });
};
