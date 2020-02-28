import { getRepository } from 'typeorm';
import { validateOrReject } from 'class-validator';
import { FileUpload } from 'graphql-upload';

import Place from '../../models/Place';
import { ResolverMap } from '../../@types';

type Queries = 'getPlace' | 'getPlaces';
type Mutations = 'createPlace' | 'updatePlace' | 'deletePlace';
interface Input {
  id: number;
  name: string;
  photo: Promise<FileUpload>;
  latitude: number;
  longitude: number;
}

export const placeById = async (id: number) => {
  const place = await getRepository(Place).findOne(id, {
    relations: ['debitAccounts', 'creditAccounts'],
  });
  if (!place) throw new Error('no place with such id');
  return placeResolver(place);
};

export const placeResolver = ({ ...place }: Place) => ({
  ...place,
});

const resolvers: ResolverMap<Input, Queries, Mutations> = {
  Query: {
    getPlaces: async () => {
      const places = await getRepository(Place).find();
      return places.map((place) => placeResolver(place));
    },
    getPlace: async (parent, { id }) => placeById(id),
  },
  Mutation: {
    createPlace: async (
      parent,
      { name, photo, latitude, longitude },
      { s3 },
    ) => {
      const place = new Place(name, latitude, longitude);
      await validateOrReject(place);

      const { createReadStream, mimetype } = await photo;
      const stream = createReadStream();
      const uri = await s3.uploadFile(mimetype, stream);
      place.photoUri = uri;

      return placeResolver(await getRepository(Place).save(place));
    },
    updatePlace: async (
      parent,
      { id, name, photo, latitude, longitude },
      { s3 },
    ) => {
      const repo = getRepository(Place);
      const place = await repo.findOne(id);
      if (!place) throw new Error('no place with such id');

      if (name && place.name !== name) place.name = name;
      if (latitude && place.latitude !== latitude) place.latitude = latitude;
      if (longitude && place.longitude !== longitude) {
        place.longitude = longitude;
      }

      await validateOrReject(place);

      if (photo) {
        const { createReadStream, mimetype } = await photo;
        const fileName = place.photoUri.split(`${process.env.S3_URL}/`)[1];
        await s3.uploadFile(mimetype, createReadStream(), fileName);
      }

      return placeResolver(await repo.save(place));
    },
    deletePlace: async (parent, { id }, { s3 }) => {
      const repo = getRepository(Place);
      const place = await repo.findOne(id);
      if (!place) throw new Error('no currency with such id');
      await Promise.all([s3.removeFile(place.photoUri), repo.remove(place)]);
      return id;
    },
  },
};

export default resolvers;
