import * as api from "../Api";

export const uploadvideo =
  ({ filedata, fileoption }) =>
    async (dispatch) => {
      try {
        const { data } = await api.uploadvideo(filedata, fileoption);
        dispatch({ type: "POST_VIDEO", data });
        await dispatch(getallvideo());
        return data;
      } catch (err) {
        console.error("uploadvideo thunk failed:", err);
        throw err;
      }
    };

export const getallvideo = () => async (dispatch) => {
  try {
    const { data } = await api.getvideos();
    dispatch({ type: "FETCH_ALL_VIDEOS", payload: data });
    return data;
  } catch (err) {
    console.error("getallvideo failed:", err);
    throw err;
  }
};

export const likevideo =
  ({ id, Like }) =>
    async (dispatch) => {
      try {
        const { data } = await api.likevideo(id, Like);
        dispatch({ type: "POST_LIKE", payload: data });
        await dispatch(getallvideo());
      } catch (err) {
        console.error("likevideo failed:", err);
        throw err;
      }
    };

export const viewvideo =
  ({ id }) =>
    async (dispatch) => {
      try {
        const { data } = await api.viewsvideo(id);
        dispatch({ type: "POST_VIEWS", payload: data });
        await dispatch(getallvideo());
      } catch (err) {
        console.error("viewvideo failed:", err);
        throw err;
      }
    };
