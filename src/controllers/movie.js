const { movie } = require("../utils/prisma");
const prisma = require("../utils/prisma");

const getMovies = async (req, res) => {
  const whereClauses = {
    runtimeMins: {},
    screenings: {
      some: {
        startsAt: {
          gte: new Date(),
        },
      },
    },
  };

  if (req.query.runtimeGreater) {
    whereClauses.runtimeMins.gt = parseInt(req.query.runtimeGreater);
  }
  if (req.query.runtimeLess) {
    whereClauses.runtimeMins.lt = parseInt(req.query.runtimeLess);
  }

  const gotMovies = await prisma.movie.findMany({
    where: whereClauses,
    include: {
      screenings: {
        where: {
          startsAt: {
            gte: new Date(),
          },
        },
      },
    },
    include: {
        screenings: true,
    }
  });

  res.json({ data: gotMovies });
};

const getOneMovie = async (req, res) => {
  const titleOrId = req.params.titleOrId;

  const id = parseInt(titleOrId);

  let specificMovie;

  if (id) {
    specificMovie = await prisma.movie.findUnique({
      where: {
        id: id,
      },
      include: {
          screenings: true,
      }
    });
  } else {
    specificMovie = await prisma.movie.findFirst({
      where: {
        title: {
            equals: titleOrId,
            mode: "insensitive"
        },
      include: {
          screenings: true,
      }
      },
    });
  }

  if (!specificMovie) {
    res.status(404)
    res.json({ error: "Movie does not exist in database" });
  } else {
    res.json({ data: specificMovie });
  }
};

const addMovie = async (req, res) => {
  const { title, runtimeMins } = req.body;

  const movieData = {
    title: title,
    runtimeMins: parseInt(runtimeMins),
  };

  if (req.body.screenings) {
    let screeningsToCreate = [];
    for (const screening of req.body.screenings) {
      screeningsToCreate.push({
        startsAt: new Date(Date.parse(screening.startsAt)),
        screenId: screening.screenId,
      });
    }
    movieData.screenings = {
      create: screeningsToCreate,
    };
  }

  const sameName = await prisma.movie.findMany({
    where: {
      title: title,
    },
  });

  if (sameName.length !== 0) {
    res.status(400)
    res.json({ error: "Film with same name already exists in database" });
    return;
  }

  const newMovie = await prisma.movie.create({
    data: movieData,
    include: {
      screenings: true,
    },
  });

  res.json({ data: newMovie });
};

const updateMovie = async (req, res) => {
  const checkMovie = await prisma.movie.findUnique({
    where: {
      id: parseInt(req.params.id),
    },
  });

  if (!checkMovie) {
    res.status(404)
    res.json({ error: "Movie does not exist" });
    return;
  }

  let updatedMovieData = {};

  if (req.body.title) {
    updatedMovieData.title = req.body.title;
  }

  if (req.body.runtimeMins) {
    updatedMovieData.runtimeMins = parseInt(req.body.runtimeMins);
  }


  if (req.body.screenings) {
    let screeningsToUpdate = [];
    for (const screening of req.body.screenings) {
      screeningsToUpdate.push({
        where: { id: parseInt(screening.id) },
        data: {
          startsAt: new Date(Date.parse(screening.startsAt)),
          screenId: screening.screenId,
        },
      });
    }
    updatedMovieData.screenings = {
      update: screeningsToUpdate,
    };
  }

  const updatedMovie = await prisma.movie.update({
    where: {
      id: parseInt(req.params.id),
    },
    data: updatedMovieData,
    include: {
      screenings: true,
    },
  });
  res.json({ data: updatedMovie });
};

module.exports = {
  getMovies,
  getOneMovie,
  addMovie,
  updateMovie,
};
