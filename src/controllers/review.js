const prisma = require("../utils/prisma");

const createReview = async (req, res) => {
  const { content, customerId, movieId } = req.body;

  const createdReview = await prisma.review.create({
    data: {
      content : content,
      movie: {
        connect: { id: parseInt(movieId) },
      },
      customer: {
        connect: { id: parseInt(customerId) },
      },
    },
    include: {
        movie: true,
        customer: true
    }
  });

  res.json({ 
      data: createdReview,
 });
};

module.exports = {
    createReview,
};
