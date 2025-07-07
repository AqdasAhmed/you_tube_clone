const commentreducer = (state = { data: null }, action) => {
    switch (action.type) {
        case "POST_COMMENT":
            return { ...state };
        case "EDIT_COMMENT":
            return { ...state };
        case "FETCH_ALL_COMMENTS":
            return { ...state, data: action.payload }
        case "TRANSLATE_COMMENT_SUCCESS":
            return { ...state, translatedComment: action.payload, error: null };
        case "TRANSLATE_COMMENT_FAIL":
            return { ...state, error: action.payload };
        default:
            return state;
    }
}
export default commentreducer