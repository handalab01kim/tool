const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

// DB 파일 생성
const db = new sqlite3.Database('dbconfig.db');

// 콜백 기반 API를 Promise로 감쌈
const allAsync = promisify(db.all.bind(db));
const runAsync = promisify(db.run.bind(db));
const prepareAsync = promisify(db.prepare.bind(db));
const initConfig = async ()=>{
    try {
        // 1. 테이블 생성
        await runAsync(`
            CREATE TABLE IF NOT EXISTS dbs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user TEXT NOT NULL,
                host TEXT NOT NULL,
                database TEXT NOT NULL,
                password TEXT NOT NULL,
                port INTEGER NOT NULL,
                tables1 TEXT,
                tables2 TEXT
            );
        `);

        // 2. 테이블 내용 조회
        const rows = await allAsync("SELECT * FROM dbs");

        if (rows.length === 0) {
        // 3. 삽입 준비 및 실행
            const stmt = await prepareAsync(`
                INSERT INTO dbs 
                    (user, host, database, password, port, tables1, tables2) 
                VALUES
                    (?, ?, ?, ?, ?, ?, ?)`);


        await promisify(stmt.run.bind(stmt))(
            "handalab",
            "172.30.1.60",
            "projects",
            "handalab",
            5433,
            "project,channel_info", 
            "logs/private.system_log/idx/View Logs, events/history/idx/View Events"
        );
        await promisify(stmt.finalize.bind(stmt))();
    }
    // 4. 최종 결과 확인
    const final = await allAsync("SELECT * FROM dbs");
    console.log("SQLITE: dbconfig", final);
    } catch (err) {
        console.error("initConfig 실패:", err);
        throw err;
    }
};


const getConfig = ()=>{
    return new Promise((resolve, reject)=>{
        let config;
        let result;
        db.all("select * from dbs", (err, rows)=>{
            if(err){
                console.log("SQLITE dbconfig get 실패");
                return reject(err);
            }
            config = rows[0];
            config.tables1 = config.tables1?.split(",").map(r=>r.trim());
    
            result = {
                db: {
                    user: config.user,
                    host: config.host,
                    database: config.database,
                    password: config.password,
                    port: config.port,
                },
                tablesToWatch: config.tables1, // 메인 뷰 테이블 리스트
                tablesToWatchInNewPage: config.tables2, // 탭 분리 테이블 리스트
            }

            // console.log("debug.slite-js.get: ",result);
            resolve(result);
        });
    });
};

const postConfig = (newDbConfig, newTables1, newTables2)=>{
    return new Promise((resolve, reject) => {
        const id = 1; // 업데이트할 레코드 ID (예: 기본값 1)
    
        const sql = `
          UPDATE dbs SET
            user = ?,
            host = ?,
            database = ?,
            password = ?,
            port = ?,
            tables1 = ?,
            tables2 = ?
          WHERE id = ?
        `;
    
        const params = [
          newDbConfig.user,
          newDbConfig.host,
          newDbConfig.database,
          newDbConfig.password,
          newDbConfig.port,
          newTables1,
          newTables2,
          id
        ];
    
        db.run(sql, params, function (err) {
          if (err) {
            // console.error("SQLITE dbconfig post 실패:", err);
            return reject(err);
          }
    
        //   console.log("DB config updated:", this.changes);
          resolve({ changes: this.changes });
        });
    });
};

// exports.default = db;
module.exports = {initConfig, getConfig, postConfig};

// 종료
// db.close();