import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.tsx";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail, Lock } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignUpClick: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSignUpClick }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login, googleSignIn, facebookSignIn } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success("Login successful!");
      onClose(); // Close modal
      navigate("/profile"); // Redirect to profile page
    } catch (error) {
      toast.error("Invalid email or password");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await googleSignIn();
      toast.success("Logged in with Google!");
      onClose(); // Close modal
      navigate("/profile"); // Redirect to profile
    } catch (error) {
      toast.error("Google sign-in failed");
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await facebookSignIn();
      toast.success("Logged in with Facebook!");
      onClose(); // Close modal
      navigate("/profile"); // Redirect to profile
    } catch (error) {
      toast.error("Facebook sign-in failed");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 relative">
        <button className="absolute top-2 right-2 text-gray-600 hover:text-red-500" onClick={onClose}>
          ✖
        </button>
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-yellow-500 text-gray-700" 
                placeholder="Enter your email" 
                required
              />
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="relative">
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-yellow-500 text-gray-700" 
                placeholder="Enter your password" 
                required
              />
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          <button type="submit" className="w-full bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 transition">
            Login
          </button>
        </form>
        <div className="mt-4 space-y-2">
          <button onClick={handleGoogleLogin} className="w-full flex items-center justify-center border py-2 rounded-lg hover:bg-gray-100 transition">
            <FcGoogle className="mr-2" size={20} />
            <div className="block text-sm font-medium text-gray-700">Login with Google</div>
          </button>
          <button onClick={handleFacebookLogin} className="w-full flex items-center justify-center border py-2 rounded-lg hover:bg-gray-100 transition">
            <FaFacebook className="mr-2 text-blue-600" size={20} />
            <div className="block text-sm font-medium text-gray-700">Login with Facebook</div>
          </button>
        </div>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account? 
            <button onClick={onSignUpClick} className="text-yellow-500 hover:underline ml-1">
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
