import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase';
import { ToastContainer, toast } from 'material-react-toastify';
import 'material-react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [disabled, setDisabled] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const uidGet = sessionStorage.getItem('uid');
        if (uidGet) navigate('/dash');
    }, [navigate]);

    const handleLogin = (e) => {
        e.preventDefault();
        
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                sessionStorage.setItem('uid', userCredential.user.uid);
                navigate('/dash');
            })
            .catch((error) => {
                if (error.code === 'auth/user-not-found') {
                    toast.error("User Not Found");
                } else if (error.code === 'auth/wrong-password') {
                    toast.error("Invalid Password.");
                } else if (error.code === 'auth/too-many-requests') {
                    toast.error("Too many failed attempts. Try again later.");
                    setDisabled(true);
                } else {
                    toast.error(error.message);
                }
            });
    };

    // Framer motion variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { 
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { 
            y: 0, 
            opacity: 1,
            transition: { duration: 0.5 }
        }
    };

    const buttonVariants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: { 
            scale: 1, 
            opacity: 1,
            transition: { duration: 0.3 }
        },
        tap: { 
            scale: 0.95,
            transition: { duration: 0.1 } 
        },
        hover: {
            scale: 1.05,
            boxShadow: "0px 5px 15px rgba(67, 56, 202, 0.3)",
            transition: { duration: 0.3 }
        }
    };

    return (
        <div className="login-container">
            {/* Left Panel - Login Form */}
            <motion.div 
                className="login-form-panel"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <motion.h1 
                    className="login-title"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    Student Login
                </motion.h1>
                
                <motion.form 
                    onSubmit={handleLogin} 
                    className="login-form"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div className="form-group" variants={itemVariants}>
                        <label className="form-label">Email Address</label>
                        <div className="input-container">
                            <div className="input-icon">
                                <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                </svg>
                            </div>
                            <motion.input
                                type="email"
                                required
                                className="form-input"
                                placeholder="Enter your email"
                                onChange={e => setEmail(e.target.value)}
                                whileFocus={{ scale: 1.01, boxShadow: "0px 0px 8px rgba(255, 255, 255, 0.3)" }}
                            />
                        </div>
                    </motion.div>
                    
                    <motion.div className="form-group" variants={itemVariants}>
                        <label className="form-label">Password</label>
                        <div className="input-container">
                            <div className="input-icon">
                                <svg className="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <motion.input
                                type={showPassword ? "text" : "password"}
                                required
                                className="form-input"
                                placeholder="Enter your password"
                                onChange={e => setPassword(e.target.value)}
                                whileFocus={{ scale: 1.01, boxShadow: "0px 0px 8px rgba(255, 255, 255, 0.3)" }}
                            />
                            <motion.div 
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    {showPassword ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7A9.97 9.97 0 014.02 8.971m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    )}
                                    {!showPassword && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />}
                                </svg>
                            </motion.div>
                        </div>
                    </motion.div>
                    
                    <motion.button
                        type="submit"
                        disabled={disabled}
                        className="login-button"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        SIGN IN
                    </motion.button>
                    
                    <motion.div 
                        className="login-links"
                        variants={itemVariants}
                    >
                        <motion.div
                            whileHover={{ x: 3, color: "#ffffff" }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Link to="/signup" className="link">
                                Don't have an account? Sign Up
                            </Link>
                        </motion.div>
                        <motion.div
                            whileHover={{ x: -3, color: "#ffffff" }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Link to="/reset" className="link">
                                Forgot password?
                            </Link>
                        </motion.div>
                    </motion.div>
                </motion.form>
            </motion.div>
            
            {/* Right Panel - Welcome Message */}
            <motion.div 
                className="welcome-panel"
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <div className="welcome-content">
                    <motion.img 
                        src="data:image/jpeg;base64,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"

                        alt="Students collaborating" 
                        className="welcome-image"
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    />
                    <motion.h2 
                        className="welcome-title"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        Welcome to Campus Connect
                    </motion.h2>
                    <motion.p 
                        className="welcome-text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.8 }}
                    >
                        Join our platform to access course materials, connect with professors, and collaborate with fellow students. Your academic journey starts here!
                    </motion.p>
                </div>
            </motion.div>
            
            <ToastContainer />
        </div>
    );
};

export default Login;