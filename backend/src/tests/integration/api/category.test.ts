import { createConnection, Connection, getRepository } from 'typeorm';
import { gql } from 'apollo-server-express';
import { keyBy } from 'lodash';

import { mountTestClient, seedTestDatabase, createPgClient } from '../../utils';
import Category from '../../../models/Category';
import { createCategory, categoryFactory } from '../../factory/categoryFactory';
import User from '../../../models/User';
import { createUser } from '../../factory/userFactory';
import { CategoryType } from '../../../graphql/helpers';

const MY_CATEGORIES = gql`
  query MyCategories {
    incomeCategories: myCategories(type: income) {
      id
      name
      type
      createdAt
      updatedAt
    }
    expenseCategories: myCategories(type: expense) {
      id
      name
      type
      createdAt
      updatedAt
    }
  }
`;

const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      type
      color
      createdAt
      updatedAt
    }
  }
`;

describe('category API calls', () => {
  let connection: Connection;
  let testUser: User;
  let incomeCategories: Category[];
  let expenseCategories: Category[];

  const pgClient = createPgClient();

  beforeAll(async () => {
    connection = await createConnection();
    await pgClient.connect();
    await seedTestDatabase(pgClient);

    testUser = (await createUser(connection)).databaseUser;
    const untrackableUser = (await createUser(connection)).databaseUser;

    incomeCategories = await Promise.all(
      Array.from(Array(5).keys()).map(() =>
        createCategory(connection, testUser.id, {
          type: CategoryType.income,
        }).then(({ databaseCategory }) => databaseCategory),
      ),
    );

    expenseCategories = await Promise.all(
      Array.from(Array(10).keys()).map(() =>
        createCategory(connection, testUser.id, {
          type: CategoryType.expense,
        }).then(({ databaseCategory }) => databaseCategory),
      ),
    );

    await Promise.all(
      Array.from(Array(4).keys()).map(() =>
        createCategory(connection, untrackableUser.id).then(
          ({ databaseCategory }) => databaseCategory,
        ),
      ),
    );
  });

  afterAll(() => {
    connection.close();
    pgClient.end();
  });

  describe('myCategories', () => {
    it('should get correct categories for the user', async () => {
      const { query } = await mountTestClient({ currentUser: testUser });
      const response = await query({ query: MY_CATEGORIES });

      expect(response).toBeSuccessful();

      expect(response.data!.incomeCategories).toHaveLength(
        incomeCategories.length,
      );

      expect(response.data!.expenseCategories).toHaveLength(
        expenseCategories.length,
      );

      const incomeCategoriesById = keyBy(response.data!.incomeCategories, 'id');

      incomeCategories.forEach((category) =>
        expect(incomeCategoriesById[category.id].id).toBe(`${category.id}`),
      );

      const expenseCategoriesById = keyBy(
        response.data!.expenseCategories,
        'id',
      );

      expenseCategories.forEach((category) =>
        expect(expenseCategoriesById[category.id].id).toBe(`${category.id}`),
      );
    });

    it('should not authorize unauthenticated users', async () => {
      const { query } = await mountTestClient();
      const response = await query({ query: MY_CATEGORIES });
      expect(response).toBeRejectedByAuth();
    });
  });

  describe('createCategory', () => {
    it('should create category', async () => {
      const testCategory = categoryFactory();

      const { mutate } = await mountTestClient({ currentUser: testUser });
      const response = await mutate({
        mutation: CREATE_CATEGORY,
        variables: { input: testCategory },
      });

      expect(response).toBeSuccessful();
      const createdCategory = await getRepository(Category).findOneOrFail(
        response.data!.createCategory.id,
      );
      expect(createdCategory.name).toBe(testCategory.name);
    });

    it('should not authorize unauthenticated users', async () => {
      const testCategory = categoryFactory();
      const { mutate } = await mountTestClient();
      const response = await mutate({
        mutation: CREATE_CATEGORY,
        variables: { input: testCategory },
      });
      expect(response).toBeRejectedByAuth();
    });
  });
});
