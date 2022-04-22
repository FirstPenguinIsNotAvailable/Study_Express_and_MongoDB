const express = require('express');
const path = require('path');
// const logger = require('./middleware/logger');

/**
 * * dotenv
 * => API 키나 계정의 ID, 비밀번호와 같은 기밀 정보를 있는 그대로 코드에 작성하거나,
 * 기밀 정보가 담긴 코드를 Github과 같은 오픈소스에 공개하는 것은 보안적으로 아주 위험한 행동이다.
 * 
 * dotenv는 .env라는 외부 파일에 중요한 정보를 환경변수로 저장하여 정보를 관리할 수 있게 해준다.
 * 그래서 dotenv를 사용하면, 전역적으로 필요한 정보나 기밀 정보와 같이 예민한 정보를
 * 일반 소스 코드 내부가 아닌 .env라는 외부 파일에 작성할 수 있게 된다.
 * 
 * .env 파일에 저장해놓은 환경 변수들을 dotenv 라이브러리를 이용해서 process.env에 설정할 수 있는다.
 * 
 * env란 NodeJS 앱이 동작할 리눅스/유닉스 시스템의 환경변수를 이용하는 것
 * process.env란 즉 NodeJS에서 서버의 환경변수를 뜻
 * 
 * reference: https://github.com/motdotla/dotenv
 * 
 */
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const fileupload = require('express-fileupload');


/*
// Route files

*/
// Load env vars
dotenv.config({ path: './config/config.env'});


// Connect to database
connectDB();

const app = express();



/**
 * * References for middleware
 * https://t1.daumcdn.net/cfile/tistory/99E980335A215AE918
 * https://psyhm.tistory.com/8
 * https://morian-kim.tistory.com/3?category=854721
 * 
 */
// app.use(logger);

// Body parser
app.use(express.json());

// Dev logging middleware
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}

// File uploading
app.use(fileupload());


// Set static folder
app.use(express.static(path.join(__dirname, 'public')));


// Mount routers
const bootcamps = require('./routes/bootcamps');
const courses = require('./routes/courses');

app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;


const server = app.listen(
    PORT, 
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red);
    // Close server & exit process
    server.close(() => process.exit(1));
});

