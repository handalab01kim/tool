module.exports = {
  db: {
    user: 'handalab',
    host: '172.30.1.60',
    database: 'projects',
    password: 'handalab',
    port: 5433,
  },
  tablesToWatch: ['project', 'channel_info', 'channel_status', 'channel_roi'], // 메인 뷰 테이블 리스트
  tablesToWatchInNewPage: "logs/private.system_log/idx/View Logs, events/history/idx/View Events",
};
// module.exports = {
//   db: {
//     user: 'handalab',
//     host: '172.30.1.60',
//     database: 'nsk',
//     password: 'handalab',
//     port: 5432,
//   },
//   tablesToWatch: ['member', 'channel_info', 'channel_status', 'channel_roi'], // 메인 뷰 테이블 리스트
// };
