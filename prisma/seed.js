const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function seed() {
  await createCustomer();
  const movies = await createMovies();
  const screens = await createScreens();
  await createScreenings(screens, movies);
  await createSeats();
  await createTickets();

  process.exit(0);
}

async function createCustomer() {
  const customer = await prisma.customer.create({
    data: {
      name: "Alice",
      contact: {
        create: {
          email: "alice@boolean.co.uk",
          phone: "1234567890",
        },
      },
    },
    include: {
      contact: true,
    },
  });

  console.log("Customer created", customer);

  return customer;
}

async function createMovies() {
  const rawMovies = [
    { title: "The Matrix", runtimeMins: 120 },
    { title: "Dodgeball", runtimeMins: 154 },
  ];

  const movies = [];

  for (const rawMovie of rawMovies) {
    const movie = await prisma.movie.create({ data: rawMovie });
    movies.push(movie);
  }

  console.log("Movies created", movies);

  return movies;
}

async function createScreens() {
  const rawScreens = [{ number: 1 }, { number: 2 }];

  const screens = [];

  for (const rawScreen of rawScreens) {
    const screen = await prisma.screen.create({
      data: rawScreen,
    });

    console.log("Screen created", screen);

    screens.push(screen);
  }

  return screens;
}

async function createScreenings(screens, movies) {
  const screeningDate = new Date();

  for (const screen of screens) {
    for (let i = 0; i < movies.length; i++) {
      screeningDate.setDate(screeningDate.getDate() + i);

      const screening = await prisma.screening.create({
        data: {
          startsAt: screeningDate,
          movie: {
            connect: {
              id: movies[i].id,
            },
          },
          screen: {
            connect: {
              id: screen.id,
            },
          },
        },
      });

      console.log("Screening created", screening);
    }
  }
}

async function createSeats() {
  const screenOne = await prisma.screen.findFirst({
    where: {
      number: 1,
    },
  });

  const screenTwo = await prisma.screen.findFirst({
    where: {
      number: 2,
    },
  });

  const rawSeats = [
    { name: "A1", screenId: screenOne.id },
    { name: "A2", screenId: screenOne.id },
    { name: "A1", screenId: screenTwo.id },
    { name: "A2", screenId: screenTwo.id },
    { name: "B1", screenId: screenTwo.id },
    { name: "B2", screenId: screenTwo.id },
  ];

  const seats = [];

  for (const rawSeat of rawSeats) {
    const seat = await prisma.seat.create({
      data: rawSeat,
    });

    console.log("Seats created", seat);

    seats.push(seat);
  }

  return seats;
}

async function createTickets() {
  const ticket = await prisma.ticket.create({
    data: {
      screening: {
          connect : { id : 1 }
      },
      customer: {
          connect: { id : 1 }
      },
      seats: {
        connect: [{ id: 1 }, { id: 2 }],
      },
    },
  });

  const ticket2 = await prisma.ticket.create({
    data: {
      screening: {
          connect : { id : 2 }
      },
      customer: {
          connect: { id : 1 }
      },
      seats: {
        connect: [{ id: 1 }, { id: 2 } ],
      },
    },
  });

  const ticket3 = await prisma.ticket.create({
    data: {
      screening: {
          connect : { id : 3 }
      },
      customer: {
          connect: { id : 1 }
      },
      seats: {
        connect: [{ id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }],
      },
    },
  });

}

seed()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
  })
  .finally(() => process.exit(1));
