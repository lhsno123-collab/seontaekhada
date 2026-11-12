/** 영문 대/소문자·숫자·특수문자를 모두 포함한 8자 이상. */
export const PASSWORD_RULE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const PASSWORD_HINT = "8자 이상, 영문 대/소문자·숫자·특수문자 모두 포함";
