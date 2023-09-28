import * as dynamoose from 'dynamoose';

export class Artist {
  title: string;
  imageUrl: string;
}

export const ArtistSchema = new dynamoose.Schema({
  title: String, // TODO: For some weird reason this name cannot be changed
  imageUrl: String,
});
