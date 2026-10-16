// Her isteğin saatini, yöntemini ve adresini konsola yazar
const logger = (req, res, next) => {
  const time = new Date().toLocaleTimeString();
  console.log(`[${time}] ${req.method} ${req.url}`);
  next();
};

module.exports = logger;
