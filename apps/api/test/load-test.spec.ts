import http from 'k6/http'
import { Options } from 'k6/options'

export const options: Options = {
    vus: 100,
    duration: "5s",
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.1']
    },
    // stages: [
    //     {
    //         duration: "1m",
    //         target: 50
    //     },
    //     {
    //         duration: "3m",
    //         target: 50
    //     },
    //     {
    //         duration: "1m",
    //         target: 0
    //     }
    // ]
}

export default function() {
    http.get("http://localhost:4000")
}