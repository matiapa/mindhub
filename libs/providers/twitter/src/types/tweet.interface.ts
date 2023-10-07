export interface Tweet {
  tweet: {
    edit_info: {
      initial: {
        editTweetIds: string[];
        editableUntil: string;
        editsRemaining: string;
        isEditEligible: boolean;
      };
    };
    retweeted: boolean;
    source: string;
    entities: {
      hashtags: any[]; // You can create a separate interface for hashtags if needed
      symbols: any[]; // You can create a separate interface for symbols if needed
      user_mentions: UserMention[];
      urls: any[]; // You can create a separate interface for URLs if needed
    };
    display_text_range: string[];
    favorite_count: string;
    in_reply_to_status_id_str: string;
    id_str: string;
    in_reply_to_user_id: string;
    truncated: boolean;
    retweet_count: string;
    id: string;
    in_reply_to_status_id: string;
    created_at: string;
    favorited: boolean;
    full_text: string;
    lang: string;
    in_reply_to_screen_name: string;
    in_reply_to_user_id_str: string;
  };
}

interface UserMention {
  name: string;
  screen_name: string;
  indices: string[];
  id_str: string;
  id: string;
}
