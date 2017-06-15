import axios from 'axios';

var instance = axios.create({
    baseURL: 'http://localhost:3000/'
});

export default instance;