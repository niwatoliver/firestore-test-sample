const firebase = require('@firebase/testing');
const fs = require('fs');

const projectId = 'firestore-emulator-example';
const rules = fs.readFileSync('firestore.rules', 'utf8');

function authedApp(auth) {
  return firebase.initializeTestApp({ projectId, auth }).firestore();
}

// エミュレータに残ってるデータお掃除と、Ruleの読み込みを行なっている
beforeEach(async () => { await firebase.clearFirestoreData({ projectId }); });
before(async () => { await firebase.loadFirestoreRules({ projectId, rules }); });
after(async () => { await Promise.all(firebase.apps().map(app => app.delete())); });

describe('Firestore tests', async () => {
  describe('正常系', async () => {
    // 本来であれば境界値でテストしたい
    it("Email4~256文字, Name 4~16文字", async () => {
      const db = authedApp(null);
      const user = db.collection("users").doc("sampleUser");
      await firebase.assertSucceeds(
        user.set({ name: "Oliver", email: 'oliver@example.com' })
      );
    });
  });

  describe('非正常系', async () => {
    it("Email4~256文字, Name 3文字", async () => {
      const db = authedApp(null);
      const user = db.collection("users").doc("sampleUser");
      await firebase.assertFails(
        user.set({ name: "Oli", email: 'oliver@example.com' })
      );
    });
    it("Email3文字, Name 4~16文字", async () => { });
    it("Email257文字, Name 4~256文字", async () => { });
    it("Email4~256文字, Name 17文字", async () => { });
  });
});
