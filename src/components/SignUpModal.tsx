import React, { useState } from "react";
import { Mail, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext.tsx";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose, onLoginClick }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { signup, googleSignIn, facebookSignIn } = useAuth();
  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(email, password, name);  // Include name here
      toast.success("Sign-up successful!");
      onClose(); // Close modal
      navigate("/profile"); // Redirect to profile
    } catch (error) {
      toast.error("Sign up failed! Check your details.");
    }
  };
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 relative">
        {/* Close Button */}
        <button className="absolute top-2 right-2 text-gray-600 hover:text-red-500" onClick={onClose}>
          ✖
        </button>

        {/* Header */}
        <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>

        {/* Sign Up Form */}
        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <div className="relative">
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="w-full px-4 py-2 pl-10 border rounded-lg focus:ring-2 focus:ring-yellow-500 text-gray-700" 
                placeholder="Enter your name" 
                required
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          
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
            Sign Up
          </button>
        </form>

        {/* Alternative Login Options */}
        <div className="mt-4 space-y-2">
          <button 
            onClick={googleSignIn} 
            className="w-full flex items-center justify-center border py-2 rounded-lg hover:bg-gray-100 transition"
          >
            <FcGoogle className="mr-2" size={20} /> 
            <div className="block text-sm font-medium text-gray-700">Sign up with Google</div>
          </button>
          <button 
            onClick={facebookSignIn} 
            className="w-full flex items-center justify-center border py-2 rounded-lg hover:bg-gray-100 transition"
          >
            <FaFacebook className="mr-2 text-blue-600" size={20} />
            <div className="block text-sm font-medium text-gray-700">Sign up with Facebook</div>
          </button>
        </div>

        {/* Login Link */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account? 
            <button onClick={onLoginClick} className="text-yellow-500 hover:underline ml-1">
              Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpModal;
