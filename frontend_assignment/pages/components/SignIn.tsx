import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useForm, SubmitHandler } from 'react-hook-form'
import * as yup from 'yup'
import { yupResolver } from "@hookform/resolvers/yup"



const theme = createTheme({
  palette: {
      secondary: {
          main: '#CDCDCD'
      }
    },
});



// Validation Schema declaration
const validationSchema = yup.object().shape({
    firstName: yup.string().matches(/^[A-Za-z ]*$/, 'Please enter valid name').min(2, "Please type your First Name, min 2 chars").max(25,"First Name can't exceed 25 chars").required(),
    lastName: yup.string().matches(/^[A-Za-z ]*$/, 'Please enter valid name').min(2, "Please type your Last Name, min 2 chars").max(25,"Last Name can't exceed 25 chars").required(),
    age: yup.number().positive().integer().min(18, "You must be older than 18").required("Please Fill with your age"),
    address: yup.string().matches(/^[0-9A-Za-z]*$/, 'Please enter valid wallet address'),
});
type formInputs = yup.InferType<typeof validationSchema>;




export default function SignIn(): JSX.Element {
  // destructure the necessary tools from useForm()
  const { register, handleSubmit, formState:{errors}} = useForm<formInputs>({ resolver: yupResolver(validationSchema) });
    
  //Apply yup validation && console.log input in JSON format 
  const submitForm: SubmitHandler<formInputs> = data => console.log(JSON.stringify(data));
  
  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1,  bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon style={{fill: "#214e34"}} />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          
           {/* Sign in Form */}
          <Box component="form" onSubmit={handleSubmit(submitForm)} noValidate sx={{ mt: 1 }}>
                       
            
            {/* First Name Input */}
            <TextField
              margin="normal"
              required
              fullWidth
              {...register("firstName")}
              id="firstName"
              label="First Name"
              name="firstName"
              helperText={errors.firstName?.message}
              autoFocus
            />

            
            {/* Last Name Input */}
            <TextField
              margin="normal"
              required
              fullWidth
              {...register("lastName")}
              id="lastName"
              label="Last Name"
              name="lastName"
              helperText={errors.lastName?.message}
            />

            
            {/* Age Name Input */}
            <TextField
              margin="normal"
              required
              fullWidth
              {...register("age")}
              id="age"
              label="Age"
              name="age"
              helperText={errors.age?.message}
            />
            
            {/* Wallet Address Input */}
            <TextField
              margin="normal"
              fullWidth
              {...register("address")}
              id="address"
              label="Wallet Address"
              name="address"
              helperText={errors.address?.message}
            />

             {/* Form Submit Button */}
            <Button
              color='secondary'
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign In
            </Button>
         </Box>
        </Box>
        
      </Container>
    </ThemeProvider>
  );
}
