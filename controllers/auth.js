const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require("jsonwebtoken");
const config = require('../config/secret')

exports.signup = async (req, res) => {
    try{

        const { name, email, phoneNumber, profileImag, password } = req.body;

        
        // Validate user input
        if (!(email && password && name && phoneNumber)) {
            return res.status(400).send("All input is required");
        }

        const exUser = await User.findOne({$or:[{email},{phoneNumber}]});
        
        if (exUser) {
            return res.status(409).send("User Already Exist. Please Login");
          }

        const encryptedPassword = await bcrypt.hash(password, 10);
        
        const verCode = (Math.floor(Math.random() * 100000)+100000).toString();

        const token = (Math.floor(Math.random() * 10000000)+1000000).toString();

        // Create user in our database
        const user = await User.create({
            name,
            email,
            phoneNumber,
            password: encryptedPassword,
            profileImag : profileImag||null,
            verCode : verCode,
            token
        });
        // return new user
        res.status(201).send({ message: `welcome ${user.name} your account created well you can login Now and active your acc` });
    }catch(err){
        res.status(500).send({ error: err });
    }
}

exports.active = async (req, res) => {
    try{

        const {verCode} = req.body;

        if (req.user.isActive) {
            return res.send("your acc is already active");
          }

        // Validate user input
        if (!verCode) {
            return res.send("verCode is required");
        }

        const user = await User.findById(req.user._id);

        if ((verCode!=user.verCode)||verCode==null) {
            return res.send("verCode is NOT correct");
          }

          
        const token = (Math.floor(Math.random() * 10000000)+1000000).toString();

        await User.findByIdAndUpdate(
            { _id: user._id },
            { isActive: true, verCode: null,token },
            function(err, result) {
              if (err) {
                res.send(err);
              } else {
                const newtoken = jwt.sign(
                    { _id: user._id, email:user.email, isActive:user.isActive, token:user.token },
                        config.TOKEN_KEY,
                    {
                        expiresIn: "24h",
                    }
                );
                res.send({ message:"your acc is active Now",token:newtoken} );
              }
            }
          );
    }catch(err){
        res.status(500).send({ error: err });
    }
}

exports.login = async (req, res) => {
    try{
        const {email, password } = req.body;

        
        // Validate user input
        if (!(email && password)) {
            return res.status(400).send("email and pass are required");
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send("this email not exist you can sign up");
        }

        var passwordIsValid = bcrypt.compareSync(password, user.password);

        if (!passwordIsValid) {
            return res.status(401).send({ errMsg: "Invalid Password!"});
        }

        const token = jwt.sign(
            { _id: user._id, email, isActive:user.isActive, token:user.token },
                config.TOKEN_KEY,
            {
                expiresIn: "24h",
            }
        );
        if(!user.isActive){
            //send verificatin code to user
            res.status(201).send({ message: `welcome ${user.name} please active your acc `,token:token });
        }

        res.status(201).send({ message: `welcome ${user.name} `,token:token });
    }catch(err){
        res.status(500).send({ error: err });
    }
}

exports.forgot = async (req, res) => {
    try{
        if (!req.body.phoneNumber) {
            return res.status(400).send("please set your phNm");
        }

        const user = await User.findOne({ phoneNumber: req.body.phoneNumber});

        if (!user) {
            return res.status(400).send("this phNm not correct");
        }

        const verCode = (Math.floor(Math.random() * 100000)+100000).toString();

        await User.findByIdAndUpdate(
            { _id: user._id },
            { verCode },
            function(err, result) {
              if (err) {
                res.send(err);
              } else {
                const token = jwt.sign(
                    { _id: user._id},
                        config.TOKEN_KEYShort,
                    {
                        expiresIn: "120s",
                    }
                );
                res.send({ message: `check your phone for verification code `,token:token });
              }
            }
          );

    }catch(err){
        res.status(500).send({ error: err });
    }
}

exports.checkVerCode = async (req, res) => {
    try{

        const {verCode} = req.body;

        // Validate user input
        if (!verCode) {
            return res.status(400).send("verCode is required");
        }

        const user = await User.findById(req.user._id);

        if ((verCode!=user.verCode)||verCode==null) {
            return res.status(500).send("verCode is NOT correct");
          }

        await User.findByIdAndUpdate(
            { _id: user._id },
            {verCode: null },
            function(err, result) {
              if (err) {
                res.send(err);
              } else {
                const token = jwt.sign(
                    { _id: user._id},
                        config.TOKEN_KEYShort,
                    {
                        expiresIn: "300s",
                    }
                );
                res.send({ message: `Now you can reset your pass`,token:token });
              }
            }
          );

    }catch(err){
        res.status(500).send({ error: err });
    }
}

exports.resetpass = async (req, res) => {
    try{

        const {password} = req.body;

        // Validate user input
        if (!password) {
            return res.status(400).send("new password is required");
        }

        const user = await User.findById(req.user._id);

        if (user.verCode!=null) {
            return res.status(500).send("you can Not reset pass without set verification code");
          }

        const encryptedPassword = await bcrypt.hash(password, 10);

        await User.findByIdAndUpdate(
            { _id: user._id },
            {password: encryptedPassword },
            function(err, result) {
              if (err) {
                res.send(err);
              } else {
                res.send({ message: `well Done Now you can login`});
              }
            }
          );

    }catch(err){
        res.status(500).send({ error: err });
    }
}

exports.edit = async (req, res) => {
    try{
        
        const {name , profileImag} = req.body;
        const token = (Math.floor(Math.random() * 10000000)+1000000).toString();

        const upDate = {name, profileImag, token}

        if(!name&&!profileImag){ 
            return res.send({ errMsg: `name or proImg is required`});
        }

        await User.findByIdAndUpdate(
            { _id: req.user._id },
            upDate,
            function(err, result) {
            if (err) {
                res.send(err);
            } else {
                res.send({ message: `your acc updated done`});
            }
            }
        );

    }catch(err){
        res.status(500).send({ error: err });
    }
    

}