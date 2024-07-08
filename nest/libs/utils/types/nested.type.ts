type Nullable<T> = T | undefined;

export type NestedKeyOf<T> = keyof T;

// export type NestedKeyOf<T extends Nullable<object>> = {
//   [Key in keyof NonNullable<T> &
//     (string | number)]: NonNullable<T>[Key] extends Nullable<object>
//     ? Key | `${Key}.${NestedKeyOf<NonNullable<T>[Key]>}`
//     : `${Key}`;
// }[keyof NonNullable<T> & (string | number)];

// export type NestedPartial<K> = {
//   [attr in keyof K]?: K[attr] extends object
//     ? NestedPartial<K[attr]>
//     : K[attr] extends object | null
//     ? NestedPartial<K[attr]> | null
//     : K[attr] extends object | null | undefined
//     ? NestedPartial<K[attr]> | null | undefined
//     : K[attr];
// };
