const prisma = require('../utils/prisma');

const createScreen = async (req, res) => {

    const {
        number
    } = req.body;

    const screenData = {
        number: number,
      };
    
      if (req.body.screenings) {
        let screeningsToCreate = [];
        for (const screening of req.body.screenings) {
          screeningsToCreate.push({
            startsAt: new Date(Date.parse(screening.startsAt)),
            movieId: screening.movieId,
          });
        }
        screenData.screenings = {
          create: screeningsToCreate,
        };
      }
    
      const sameNumber = await prisma.screen.findMany({
        where: {
          number: number,
        },
      });
    
      if (sameNumber.length !== 0) {
        res.json({ error: "Screen with same number already exists" });
        return;
      }
    
      const newScreen = await prisma.screen.create({
        data: screenData,
        include: {
          screenings: true,
        },
      });
    
      res.json({ data: newScreen });

}


module.exports = {
   createScreen
};
