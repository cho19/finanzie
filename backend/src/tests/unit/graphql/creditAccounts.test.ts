/* eslint-disable no-multi-assign */
/* eslint-disable no-empty */
import * as typeorm from 'typeorm';
import * as classValidator from 'class-validator';
import * as resolvers from '../../../graphql/resolvers/creditAccount';
import * as creditAccountModel from '../../../models/CreditAccount';
import { currencyById } from '../../../graphql/resolvers/currency';

const exampleAccount: any = {
  id: 0,
  name: 'Example Account 1',
  bank: 'Example Bank 1',
  initialBalance: 0,
  currency: { id: 0 },
  billingDay: 1,
  paymentDay: 2,
};

jest.mock('../../../graphql/resolvers/currency', () => ({
  currencyById: jest.fn(),
}));

describe('Debit account resolvers', () => {
  let getRepository: jest.SpyInstance;
  let validateOrReject: jest.SpyInstance;
  let creditAccountResolver: jest.SpyInstance;
  let creditAccountById: jest.SpyInstance;
  let find: jest.Mock;
  let findOne: jest.Mock;
  let save: jest.Mock;
  let remove: jest.Mock;

  const CreditAccount = ((creditAccountModel.default as any) = jest.fn());

  beforeEach(() => {
    find = jest.fn(() => [exampleAccount]);
    findOne = jest.fn(() => exampleAccount);
    save = jest.fn(() => exampleAccount);
    remove = jest.fn(() => 0);

    getRepository = jest
      .spyOn(typeorm, 'getRepository')
      .mockImplementation(() => ({ find, findOne, save, remove } as any));

    validateOrReject = jest
      .spyOn(classValidator, 'validateOrReject')
      .mockImplementation();
  });

  afterEach(() => {
    (currencyById as jest.Mock).mockClear();
    getRepository.mockClear();
    validateOrReject.mockClear();
    find.mockClear();
    findOne.mockClear();
    save.mockClear();
    remove.mockClear();
    CreditAccount.mockClear();
  });

  describe('creditAccountById', () => {
    beforeEach(() => {
      creditAccountResolver = jest.spyOn(resolvers, 'creditAccountResolver');
    });

    afterEach(() => creditAccountResolver.mockClear());
    afterAll(() => creditAccountResolver.mockRestore());

    it('should call creditAccountResolver once', async () => {
      findOne.mockImplementation(() => exampleAccount);
      await resolvers.creditAccountById(0);
      expect(creditAccountResolver).toHaveBeenCalledTimes(1);
    });

    it('should call creditAccountResolver with correct argument', async () => {
      findOne.mockImplementation(() => exampleAccount);
      await resolvers.creditAccountById(0);
      expect(creditAccountResolver).toHaveBeenCalledWith(exampleAccount);
    });

    it("should throw error if find doesn't succeed", async () => {
      findOne.mockImplementation(() => null);
      expect(resolvers.creditAccountById(0)).rejects.toBeTruthy();
    });

    it("should not call creditAccountResolver if find doesn't succeed", async () => {
      findOne.mockImplementation(() => null);

      try {
        await resolvers.creditAccountById(0);
      } catch (err) {}

      expect(creditAccountResolver).not.toHaveBeenCalled();
    });
  });

  describe('creditAccountsById', () => {
    beforeEach(() => {
      creditAccountResolver = jest.spyOn(resolvers, 'creditAccountResolver');
    });

    afterEach(() => creditAccountResolver.mockClear());
    afterAll(() => creditAccountResolver.mockRestore());

    it('should call creditAccountResolver twice', async () => {
      find.mockImplementation(() => [exampleAccount, exampleAccount]);
      await resolvers.creditAccountsById([1, 2]);
      expect(creditAccountResolver).toHaveBeenCalledTimes(2);
    });

    it('should call creditAccountResolver with correct arguments', async () => {
      const ret = [exampleAccount, exampleAccount];
      find.mockImplementation(() => ret);
      await resolvers.creditAccountsById([1, 2]);

      expect(creditAccountResolver).toHaveBeenNthCalledWith(1, exampleAccount);
      expect(creditAccountResolver).toHaveBeenNthCalledWith(2, exampleAccount);
    });

    it('should return an empty list if no ids given', async () =>
      expect(await resolvers.creditAccountsById([])).toHaveLength(0));

    it('should not call find nor creditAccountResolver if no ids given', async () => {
      await resolvers.creditAccountsById([]);

      expect(find).not.toHaveBeenCalled();
      expect(creditAccountResolver).not.toHaveBeenCalled();
    });
  });

  describe('creditAccountResolver', () => {
    it('should generate static properties correctly', () => {
      const creditAccount = resolvers.creditAccountResolver(exampleAccount);
      expect(creditAccount.id).toBe(exampleAccount.id);
      expect(creditAccount.name).toBe(exampleAccount.name);
      expect(creditAccount.bank).toBe(exampleAccount.bank);
      expect(creditAccount.initialBalance).toBe(exampleAccount.initialBalance);
      expect(creditAccount.billingDay).toBe(exampleAccount.billingDay);
      expect(creditAccount.paymentDay).toBe(exampleAccount.paymentDay);
    });

    it('should call currencyById one time if executed mapping', () => {
      const creditAccount = resolvers.creditAccountResolver(exampleAccount);
      creditAccount.currency();
      expect(currencyById).toHaveBeenCalledTimes(1);
    });
  });

  describe('Query', () => {
    describe('getCreditAccounts', () => {
      const getCreditAccounts = resolvers.default.Query
        .getCreditAccounts as any;

      it('should call find when invoked getCreditAccounts', async () => {
        await getCreditAccounts();
        expect(find).toHaveBeenCalledTimes(1);
      });

      it('should map results of query into creditAccountResolver', async () => {
        creditAccountResolver = jest
          .spyOn(resolvers, 'creditAccountResolver')
          .mockImplementation();

        getRepository.mockImplementation(() => ({ find: () => [1, 2] }));
        await getCreditAccounts();
        expect(creditAccountResolver).toHaveBeenCalledTimes(2);

        expect(creditAccountResolver).toHaveBeenNthCalledWith(1, 1, 0, [1, 2]);
        expect(creditAccountResolver).toHaveBeenNthCalledWith(2, 2, 1, [1, 2]);
        creditAccountResolver.mockRestore();
      });
    });

    describe('getCreditAccount', () => {
      const getCreditAccount = resolvers.default.Query.getCreditAccount as any;

      beforeEach(() => {
        creditAccountById = jest
          .spyOn(resolvers, 'creditAccountById')
          .mockImplementation();

        getRepository.mockImplementation(() => 'Example repository');
      });

      afterEach(() => creditAccountById.mockClear());
      afterAll(() => creditAccountById.mockRestore());

      it('should call creditAccountById with correct id', async () => {
        await getCreditAccount(null, { id: 0 });
        expect(creditAccountById).toHaveBeenCalledTimes(1);
        expect(creditAccountById).toHaveBeenCalledWith(0);
      });
    });
  });

  describe('Mutation', () => {
    describe('createCreditAccount', () => {
      const createCreditAccount = resolvers.default.Mutation
        .createCreditAccount as any;

      it('should construct new CreditAccount when invoked', async () => {
        findOne.mockImplementation(() => 'exampleCurrency');

        await createCreditAccount(null, {
          name: 'Example',
          bank: 'Example',
          initialBalance: 0,
          currencyId: 0,
          billingDay: 2,
          paymentDay: 1,
        });

        expect(CreditAccount).toHaveBeenCalledTimes(1);
        expect(CreditAccount).toHaveBeenCalledWith(
          'Example',
          'Example',
          0,
          'exampleCurrency' /* Result of mock */,
          2,
          1,
        );
      });

      it('should call repository save method when invoked', async () => {
        await createCreditAccount(null, { name: 'Example' });
        expect(save).toHaveBeenCalledTimes(1);
        expect(save).toHaveBeenCalledWith(new CreditAccount('Example'));
      });

      it('should reject if no account found', async () => {
        getRepository.mockImplementation(() => ({ findOne: () => null }));
        expect(createCreditAccount(null, { id: 0 })).rejects.toBeTruthy();
      });

      it('should call rejectOrValidate when invoked', async () => {
        await createCreditAccount(null, { name: 'Example' });
        expect(validateOrReject).toHaveBeenCalledTimes(1);
        expect(validateOrReject).toHaveBeenCalledWith(
          new CreditAccount('Example'),
        );
      });
    });

    describe('updateCreditAccount', () => {
      const updateCreditAccount = resolvers.default.Mutation
        .updateCreditAccount as any;

      beforeEach(() => {
        creditAccountResolver = jest
          .spyOn(resolvers, 'creditAccountResolver')
          .mockImplementation();
      });

      afterEach(() => creditAccountResolver.mockClear());

      it('should call findOne method of getRepository', async () => {
        await updateCreditAccount(null, { id: 0 });
        expect(findOne).toHaveBeenCalledTimes(1);
        expect(findOne).toHaveBeenCalledWith(0, { relations: ['currency'] });
      });

      it("should reject if find doesn't succeed", async () => {
        getRepository.mockImplementation(() => ({ findOne: () => null }));
        expect(updateCreditAccount(null, { id: 0 })).rejects.toBeTruthy();
      });

      it('should change base attributes if given', async () => {
        const reference = {
          name: 'Not modified',
          bank: 'Not modified',
          initialBalance: 1,
          billingDay: 1,
          paymentDay: 2,
        };

        findOne.mockImplementation(() => reference);

        await updateCreditAccount(null, {
          id: 0,
          name: 'Modified',
          bank: 'Modified',
          initialBalance: 0,
          billingDay: 2,
          paymentDay: 3,
        });

        expect(reference.name).toBe('Modified');
        expect(reference.bank).toBe('Modified');
        expect(reference.initialBalance).toBe(0);
        expect(reference.billingDay).toBe(2);
        expect(reference.paymentDay).toBe(3);
      });

      it('should change currency if id given', async () => {
        const reference = { currency: { id: 0, name: 'Not modified' } };

        findOne.mockImplementation(() => reference);
        getRepository.mockImplementation((model: jest.Mock) => {
          if (model === CreditAccount) return { findOne, save };
          return { findOne: () => ({ id: 1, name: 'Modified' }) };
        });

        await updateCreditAccount(null, { id: 0, currencyId: 1 });
        expect(reference.currency).toMatchObject({ id: 1, name: 'Modified' });
      });

      it('should reject if no currency found with given id', async () => {
        getRepository.mockImplementation((model: jest.Mock) => {
          if (model === CreditAccount) return { findOne };
          return { findOne: () => null };
        });

        expect(
          updateCreditAccount(null, { id: 0, currencyId: 1 }),
        ).rejects.toBeTruthy();
      });

      it('should call save on happy path', async () => {
        await updateCreditAccount(null, { id: 0 });
        expect(save).toHaveBeenCalledTimes(1);
        expect(save).toHaveBeenCalledWith(exampleAccount);
      });

      it('should call rejectOrValidate on happy path', async () => {
        await updateCreditAccount(null, { id: 0 });
        expect(validateOrReject).toHaveBeenCalledTimes(1);
        expect(validateOrReject).toHaveBeenCalledWith(exampleAccount);
      });

      it('should wrap result on creditAccountResolver on happy path', async () => {
        save.mockImplementation(() => 'dummy');
        await updateCreditAccount(null, { id: 0 });
        expect(creditAccountResolver).toHaveBeenCalledTimes(1);
        expect(creditAccountResolver).toHaveBeenCalledWith('dummy');
      });
    });

    describe('deleteCreditAccount', () => {
      const deleteCreditAccount = resolvers.default.Mutation
        .deleteCreditAccount as any;

      beforeEach(() => {
        creditAccountResolver = jest
          .spyOn(resolvers, 'creditAccountResolver')
          .mockImplementation();
      });

      it('should call findOne method of getRepository', async () => {
        await deleteCreditAccount(null, { id: 0 });
        expect(findOne).toHaveBeenCalledTimes(1);
        expect(findOne).toHaveBeenCalledWith(0);
      });

      it("should reject if find doesn't succeed", async () => {
        getRepository.mockImplementation(() => ({ findOne: () => null }));
        expect(deleteCreditAccount(null, { id: 0 })).rejects.toBeTruthy();
      });

      it('should call remove on happy path', async () => {
        await deleteCreditAccount(null, { id: 0, name: 'Modified' });
        expect(remove).toHaveBeenCalledTimes(1);
        expect(remove).toHaveBeenCalledWith(findOne());
      });
    });
  });
});