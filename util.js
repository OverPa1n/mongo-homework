const faker = require('faker');

const generateUser = ({
  firstName = faker.name.firstName(),
  lastName = faker.name.lastName(),
  department,
  createdAt = new Date()
} = {}) => ({
  firstName,
  lastName,
  department,
  createdAt
});
const generateArticles = ({
  name = faker.name.title(),
  description = faker.lorem.sentence(),
  type,
  tags = []
} = {}) => ({
  name,
  description,
  type,
  tags

});

module.exports = {
  mapUser: generateUser,
  mapArticles: generateArticles,
  getRandomFirstName: () => faker.name.firstName()
};
