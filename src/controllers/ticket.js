const prisma = require("../utils/prisma");

const createTicket = async (req, res) => {
  const { screeningId, customerId } = req.body;

  const createdTicket = await prisma.ticket.create({
    data: {
      screeningId: screeningId,
      customerId: customerId
      },
      include: {
        screening : {
          include : {
          movie: true,
          screen: true
        },
      },
        customer : true,
      }
  });

  res.json({ data: createdTicket })

};

module.exports = {
  createTicket,
};
