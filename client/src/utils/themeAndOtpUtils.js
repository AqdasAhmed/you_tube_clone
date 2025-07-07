export const getThemeAndOtpMethod = (state) => {
    // const state = "Tamil Nadu"; // Example state for testing
    if (!state) {
        console.error("State is null or undefined. Defaulting to dark theme and mobile OTP.");
        return { theme: "dark", otpMethod: "mobile" };
    }

    const currentHour = new Date().getHours();
    const southStates = ["Tamil Nadu", "Kerala", "Karnataka", "Andhra Pradesh", "Telangana"];
    const isSouthern = southStates.map(s => s.toLowerCase()).includes(state.toLowerCase());
    const isWithinTime = currentHour >= 10 && currentHour <= 12;

    const theme = isWithinTime || isSouthern ? "light" : "dark";
    const otpMethod = isSouthern ? "email" : "mobile";

    return { theme, otpMethod };
};

