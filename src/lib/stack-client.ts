import { StackClientApp } from "@stackframe/stack";

export const stackClient = new StackClientApp({
  tokenStore: "nextjs-cookie",
}); 