// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import Button from "../components/Button";
// import Heading from "../components/Heading";
// import InputComponent from "../components/InputComponent";
// import BG from "../assets/BgInferno.svg";
// const SIGNIN_URL = import.meta.env.VITE_SIGNIN;


// export default function Signin() {
//   const navigate = useNavigate();
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState(null);


//   const handleSubmit = async () => {
//     setError(null);
//     console.log("Logging in with:", username, email, password);
  
//     try {
//       const response = await fetch(`${SIGNIN_URL}`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ username, password }), // email is not required here
//       });
  
//       const data = await response.json();
//       console.log("Login Response:", data);
  
//       if (!response.ok) {
//         throw new Error(data.error || "Invalid login credentials");
//       }
  
//       // ✅ Store JWT token in localStorage
//       localStorage.setItem("jwt_token", data.token);
  
//       navigate("/landing");
//     } catch (err) {
//       setError(err.message || "Login failed");
//     }
//   };
  

//   return (
//     <div
//       className="flex items-center justify-center min-h-screen bg-cover"
//       style={{ backgroundImage: `url(${BG})` }}
//     >
//       <div className="bg-gray-900 bg-opacity-90 p-8 rounded-lg shadow-lg text-center w-96 backdrop-blur-sm">
//         <Heading heading="Sign In" className="text-white" />
//         {error && <p className="text-red-500">{error}</p>}
//         <div className="mt-4 space-y-4 flex flex-col items-center">
//           <div className="w-full">
//             <label className="block text-gray-300 font-medium mb-1 text-left">
//               Username
//             </label>
//             <InputComponent
//               type="text"
//               placeholder="Enter your username"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               className="bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 w-full"
//             />
//           </div>

//           <div className="w-full">
//             <label className="block text-gray-300 font-medium mb-1 text-left">
//               Email ID
//             </label>
//             <InputComponent
//               type="text"
//               placeholder="Enter your email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 w-full"
//             />
//           </div>

//           <div className="w-full">
//             <label className="block text-gray-300 font-medium mb-1 text-left">
//               Password
//             </label>
//             <InputComponent
//               type="password"
//               placeholder="Enter your password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 w-full"
//             />
//           </div>

//           <Button
//             text="Submit"
//             onClick={handleSubmit}
//             className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }



import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button";
import Heading from "../components/Heading";
import InputComponent from "../components/InputComponent";
import BG from "../assets/BgInferno.svg";

const SIGNIN_URL = import.meta.env.VITE_SIGNIN;
const VERIFY_OTP_URL = import.meta.env.VITE_VERIFY_OTP;

export default function Signin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [otp, setOtp] = useState("");
  const [tempToken, setTempToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await fetch(`${SIGNIN_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Invalid login credentials");
      }

      // Store temporary token and show OTP verification
      setTempToken(data.tempToken);
      setShowOtpVerification(true);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await fetch(`${VERIFY_OTP_URL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tempToken}`
        },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "OTP verification failed");
      }

      // Store final JWT token
      localStorage.setItem("jwt_token", data.token);
      navigate("/landing");
    } catch (err) {
      setError(err.message || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const response = await fetch(`${SIGNIN_URL}/resend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${tempToken}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend OTP");
      }

      setError("OTP resent successfully!");
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  if (showOtpVerification) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-cover"
        style={{ backgroundImage: `url(${BG})` }}
      >
        <div className="bg-gray-900 bg-opacity-90 p-8 rounded-lg shadow-lg text-center w-96 backdrop-blur-sm">
          <Heading heading="Verify OTP" className="text-white" />
          {error && <p className={`mb-4 ${error.includes("successfully") ? "text-green-500" : "text-red-500"}`}>{error}</p>}
          <div className="mt-4 space-y-4 flex flex-col items-center">
            <div className="w-full">
              <label className="block text-gray-300 font-medium mb-1 text-left">
                Enter OTP
              </label>
              <InputComponent
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 w-full"
              />
              <p className="text-gray-400 text-sm mt-1 text-left">
                OTP sent to your registered email/phone
              </p>
            </div>

            <Button
              text={isLoading ? "Verifying..." : "Verify OTP"}
              onClick={handleOtpVerification}
              disabled={isLoading || otp.length !== 6}
              className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
            />

            <button
              onClick={handleResendOtp}
              disabled={isLoading}
              className="text-purple-400 hover:text-purple-300 text-sm mt-2 disabled:opacity-50"
            >
              Resend OTP
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover"
      style={{ backgroundImage: `url(${BG})` }}
    >
      <div className="bg-gray-900 bg-opacity-90 p-8 rounded-lg shadow-lg text-center w-96 backdrop-blur-sm">
        <Heading heading="Sign In" className="text-white" />
        {error && <p className="text-red-500">{error}</p>}
        <div className="mt-4 space-y-4 flex flex-col items-center">
          <div className="w-full">
            <label className="block text-gray-300 font-medium mb-1 text-left">
              Username
            </label>
            <InputComponent
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 w-full"
            />
          </div>

          <div className="w-full">
            <label className="block text-gray-300 font-medium mb-1 text-left">
              Email ID
            </label>
            <InputComponent
              type="text"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 w-full"
            />
          </div>

          <div className="w-full">
            <label className="block text-gray-300 font-medium mb-1 text-left">
              Password
            </label>
            <InputComponent
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 w-full"
            />
          </div>

          <Button
            text={isLoading ? "Signing In..." : "Submit"}
            onClick={handleSubmit}
            disabled={isLoading}
            className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}