import * as api from "../Api";

export const editcomment = (commentdata) => async (dispatch) => {
    try {
        const { id, commentbody, like, dislike } = commentdata
        const { data } = await api.editcomment(id, { commentbody, like, dislike })
        dispatch({ type: "EDIT_COMMENT", payload: data })
        dispatch(getallcomment())
    } catch (error) {
        console.log(error)
    }
}

export const postcomment = (commentdata) => async (dispatch) => {
    try {
        const { data } = await api.postcomment(commentdata)
        dispatch({ type: "POST_COMMENT", payload: data })
        dispatch(getallcomment())
    } catch (error) {
        console.log(error)
    }
}
export const getallcomment = () => async (dispatch) => {
    try {
        const { data } = await api.getallcomment()
        dispatch({ type: "FETCH_ALL_COMMENTS", payload: data })
    } catch (error) {
        console.log(error)
    }
}

export const deletecomment = (id) => async (dispatch) => {
    try {
        await api.deletecomment(id)
        dispatch(getallcomment())
    } catch (error) {
        console.log(error)
    }
}

export const translatecomment = (comment, language) => async (dispatch) => {
    try {
        const res = await api.translatecomment(comment, language);

        dispatch({
            type: "TRANSLATE_COMMENT_SUCCESS",
            payload: res.data.translated,
        });
    } catch (error) {
        console.error("Translation error: ", error?.response?.data);
        dispatch({
            type: "TRANSLATE_COMMENT_FAIL",
            payload: error.response?.data?.error || "Translation failed",
        });
    }
};