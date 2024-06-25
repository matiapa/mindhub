import type { GetOwnUserResDto, GetOwnUserResDtoSignupStateEnum } from "@/libs/user-api-sdk";

export type SignupStateEnum = GetOwnUserResDtoSignupStateEnum;

export interface OwnUser extends GetOwnUserResDto {}
