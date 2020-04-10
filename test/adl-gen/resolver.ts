/* @generated from adl */
import { declResolver, ScopedDecl } from "./runtime/adl";
import { _AST_MAP as config } from "./config";
import { _AST_MAP as nginx } from "./nginx";
import { _AST_MAP as release } from "./release";
import { _AST_MAP as state } from "./state";
import { _AST_MAP as sys_types } from "./sys/types";
import { _AST_MAP as types } from "./types";

export const ADL: { [key: string]: ScopedDecl } = {
  ...config,
  ...nginx,
  ...release,
  ...state,
  ...sys_types,
  ...types,
};

export const RESOLVER = declResolver(ADL);
