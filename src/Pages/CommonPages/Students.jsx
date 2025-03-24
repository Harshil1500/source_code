import React, { useEffect } from 'react'
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

//mui DataGrid
// import { DataGrid } from '@mui/x-data-grid';

// firebase 
import { collection, doc, Firestore, getDocs, onSnapshot, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from '../../firebase';
import { useState } from 'react';
import { Box, Switch } from '@mui/material';


const uid = sessionStorage.getItem('uid')

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const Students = () => {
  
  const [row,setRow] = useState([]);
  
  const fatchData = async ()=>{
    const list = [];
    try{
      const querySnapshot = await getDocs(collection(db, "users"));
      querySnapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data()})
      });
      setRow(list)
    }
    catch(error)
    {
      console.log(error);
    }

      // try{
      //   const q = query(collection(db, "users"))
      //   const unsubscribe = onSnapshot(q, (querySnapshot) => {
      //     const list = [];
      //     querySnapshot.forEach((doc) => {
      //       list.push(doc.data());
      //     });
      //     setRow(list)
      //     console.log("Current Users in Users: ", list.join(", "));
      //   });
      // }
      // catch(e){
      //   console.log(e);
      // }

  }

  useEffect(()=>{
    fatchData()
  },[])

  
  const handleChange = async (event,theUID) =>{
    console.log(event.target.checked);
    console.log(theUID);
    
    const updateData = doc(db, "users",theUID);
      // update Data
      try{
        await updateDoc(updateData, {
          isEnable : event.target.checked
        });
        fatchData()
        console.log("Changes");
      }
      catch(e){
        console.log(e);
      }
    } 


    // cols for DataGrid
    const columns = [
      { field: 'id', 
        headerName: 'Er No', 
        width: 90 
      },
      {
        field: 'firstName',
        headerName: 'First name',
        width: 150,

      },
      {
        field: 'lastName',
        headerName: 'Last name',
        width: 150,

      },
      {
        field: 'email',
        headerName: 'Email',
        type: 'text',
        width: 110,

      },
      {
        field: 'Createdat',
        headerName: 'Created at',
        type: 'text',
        width: 110,

      },
      {
        field: 'Action',
        headerName: 'Action',
        type: 'text',
        width: 110,

      },
    ];
  
  return (
    <>
     {/* 
     <TableContainer component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Name</StyledTableCell>
            <StyledTableCell align="right">Enrollment</StyledTableCell>
            <StyledTableCell align="right">email&nbsp;(g)</StyledTableCell>
            <StyledTableCell align="right">phone&nbsp;(g)</StyledTableCell>
            <StyledTableCell align="right">passingYear&nbsp;(g)</StyledTableCell>
            <StyledTableCell align="right">lastSemPerc&nbsp;(g)</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {row.map((row) => (
            <StyledTableRow key={row.email}>
              <StyledTableCell component="th" scope="row">
                {row.email}
              </StyledTableCell>
              <StyledTableCell align="right">{row.erno}</StyledTableCell>
              <StyledTableCell align="right">{row.firstName}</StyledTableCell>
              <StyledTableCell align="right">{row.lastName}</StyledTableCell>
              <StyledTableCell align="right">{row.timeStemp}</StyledTableCell>
              <StyledTableCell align="right">{row.userType}</StyledTableCell>
            </StyledTableRow>
          ))}

        </TableBody>
      </Table>
    </TableContainer>
     */}
    
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 450 }} size="medium">
        <TableHead>
          <TableRow>
            <TableCell>Er No</TableCell>
            <TableCell>FirstName</TableCell>
            <TableCell>LastName</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>

      <TableBody>
          {row.map((row) => (
            <TableRow key={row.id}
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              {row.userType==='student' ? <>
              
                <TableCell component="th" scope="row">
                  {row.erNo}
                </TableCell>

                <TableCell component="th" scope="row">
                  {row.firstName}
                </TableCell >

                <TableCell component="th" scope="row">
                  {row.lastName}
                </TableCell >
              
                <TableCell component="th" scope="row">
                  {row.email}
                </TableCell >

                <TableCell component="th" scope="row">
                  {JSON.stringify(row.timeStemp)}
                  {/* {row.timeStemp['seconds']} */}
                  {/* {row.timeStemp['nanoseconds']} */}
                  {/* {serverTimestamp(row.timeStemp['seconds'] , row.timeStemp['nanoseconds']).toDate()} */}
                  {/* {Firestore.serverTimestamp.row.timeStemp}*/}
                </TableCell >

                <TableCell component="th" scope="row">
                  <Switch checked={row.isEnable} onChange={event => handleChange(event,(row.id))}/>
                </TableCell >
                </>:""}
              </TableRow>
          ))}

        </TableBody>
      </Table>
      </TableContainer>
    </>
  )
}

export default Students