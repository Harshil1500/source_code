import { CircularProgress } from '@mui/material';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import AdminDashboard from './Admin/AdminDashboard';
import PtoDashboard from './PTO/PtoDashboard'
import StudentDashboard from './student/StudentDashboard'

const Dash = () => {

    const [loader,setLoader] = useState(true)

    const [user,setUser] = useState("")
    const navigate = useNavigate();

    const userUID = sessionStorage.getItem("uid")
    // console.log(userUID);

    const fatchData = async () => {
      console.log("Fetching data for UID:", userUID); // Debugging
    
      if (!userUID) {
        console.log("No UID found in session storage!");
        setLoader(false);
        return;
      }
    
      try {
        const docRef = doc(db, "users", userUID);
        const docSnap = await getDoc(docRef);
    
        if (docSnap.exists()) {
          const userData = docSnap.data();
          console.log("User Data:", userData); // Debugging
          setUser(userData.userType);
        } else {
          console.log("No such document in Firestore for UID:", userUID);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
      
      setLoader(false);
    };
    
    
  

    
    useEffect(()=>{

        if(userUID === null){
          navigate('/')
        }
        else {
          fatchData()
        }
        /// theUser === 'admin' ? setUser('admin') : theUser === 'pto' ? setUser('pto') : theUser === 'stud' ? setUser('student') : navigate('/');
    },[])
    
  return (
    <>
        {loader &&
        <CircularProgress disableShrink/>}
        {user === 'admin' ? <AdminDashboard />  : user === 'pto' ? <PtoDashboard/>  : user === 'student' ? <StudentDashboard/>  : "" }

    </>
  )
}

export default Dash