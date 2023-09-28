import * as dynamoose from 'dynamoose';

export class Track {
  artistId: string;
  title: string;
  imageUrl: string;
}

export const TrackSchema = new dynamoose.Schema({
  artistId: String,
  title: String,
  imageUrl: String,
});
