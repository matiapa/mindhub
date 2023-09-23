import * as dynamoose from 'dynamoose';

export class Artist {
  name: string;
  imageUrl: string;
}

export const ArtistSchema = new dynamoose.Schema({
  name: String,
  imageUrl: String,
});
