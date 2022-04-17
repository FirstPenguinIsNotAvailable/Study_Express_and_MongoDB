
const http = require('http');

const todos = [
    { id: 1, text: 'Todo One'},
    { id: 2, text: 'Todo Two'},
    { id: 3, text: 'Todo Three'},
]

/**
 * http server는 request, response가 있다.
 * server: serve 하는 대상, 
 * 즉 client에서 request를 하면
 * database와 같은 공간에서 response를 가지고 온다.
 * 
 * req: request
 * res: response
 */
const server = http.createServer((req, res) => {
    // Status is not found
    // res.statusCode = 404;

    // res.setHeader('Content-Type', 'application/json');
    // res.setHeader('X-Powered-By', 'Node.js');
    /**
     * req에서 
     * method는 GET(값 가지고 오기), POST(값 저장하기), UPDATE(값 업데이트 하기), DELETE(값 지우기)이다
     * url은 '/{주소}'처럼 위치를 의미한다.
     */
    const { method, url } = req;

    let body = [];

    /**
     * req.on('data', chunk => {})이란
     * request에서 data를 받을 순간
     * chunk를 {} callback function해라는 의미
     * 
     * req.on('end', () => {})이란
     * data를 다 받았을 때 () => {}해라 
     */
    req.on('data', chunk => {
        body.push(chunk);
    }).on('end', () => {
        body = Buffer.concat(body).toString();
        console.log(body);

        /**
         * status 404는 http server가 client 쪽 문제로 인해
         * 값을 제대로 못 받아올 떄 사용
         */
        let status = 404;
        const response = {
            success: false,
            data: null
        };

        /**
         * status 200 값을 제대로 받았을 때
         * todos라는 값을 response.data에 저장한다.
         */
        if(method === 'GET' && url === '/todos'){
            status = 200;

            response.success = true;
            response.data = todos;
        } else if(method === 'POST' && url === '/todos'){
            const { id, text } = JSON.parse(body);

            if(!id || !text){
                status = 400;
                response.error = "Please fill in everything!";
            } else {
                todos.push({ id, text });
                status = 201;
    
                response.success = true;
                response.data = todos;
            }
        }

        res.writeHead(status, {
            'Content-Type': 'application/json',
            'X-Powered-By': 'Node.js'
        });

        res.end(JSON.stringify({response}));
    });

    // res.write("<h1>Hello</h1>");
    // res.write("<h2>My World</>");

});

const PORT = 5000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
