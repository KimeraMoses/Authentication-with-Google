import { useLocation } from "react-router-dom";

export const isValidEmail = (value) => {
  if (
    /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i.test(
      value
    )
  ) {
    return true;
  } else {
    return false;
  }
};

export const isEmptyObject = (obj) => {
  return JSON.stringify(obj) === "{}";
};

export function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export const clientId =
  "54430491219-ua5fgogfqp2i1e4mkpc2pona8blkpbl0.apps.googleusercontent.com";
