import { assert } from "chai";
import Database from "../../../core/database";
import { ErrorCode } from "../../../core/result";
import { WalletService } from "../../../Example/wallet";
import { clearWalletTable } from "../../utils/clear-database.test";


export function ExampleWalletServiceTest(database: Database, walletService: WalletService) {
  describe("Wallet service test", async function () {
    this.beforeEach(function () {
      clearWalletTable(database)
    })
    it("Should create a new Wallet", async function () {
      const wallet = await walletService.create({ points: 100 })
      assert.equal(wallet.status.code, ErrorCode.Created)
      assert.isFalse(wallet.status.error)
      assert.exists(wallet.result)
    })
    it("Should read a wallet", async function () {
      const wallet = await walletService.create({ points: 100 })
      const walletRead = await walletService.readOne(wallet.result!)
      assert.equal(walletRead.status.code, ErrorCode.Success)
      assert.isFalse(walletRead.status.error)
      assert.exists(walletRead.result)
      assert.equal(walletRead.result?.points, 100)
    })
    it("Should read all wallet", async function () {
      for (let i = 0; i < 12; i++) {
        await walletService.create({ points: 120 })
      }
      const walletRead1 = await walletService.readMany()
      assert.equal(walletRead1.status.code, ErrorCode.Success)
      assert.isFalse(walletRead1.status.error)
      assert.exists(walletRead1.result)
      assert.equal(walletRead1.result?.length, 10)

      const walletRead2 = await walletService.readMany(2)
      assert.equal(walletRead2.status.code, ErrorCode.Success)
      assert.isFalse(walletRead2.status.error)
      assert.exists(walletRead2.result)
      assert.equal(walletRead2.result?.length, 2)

      const walletRead3 = await walletService.readManyWithoutPagination()
      assert.equal(walletRead3.status.code, ErrorCode.Success)
      assert.isFalse(walletRead3.status.error)
      assert.exists(walletRead3.result)
      assert.equal(walletRead3.result?.length, 12)
    })
    it("Should update a wallet", async function () {
      const wallet = await walletService.create({ points: 100 })
      const walletUpdate = await walletService.update(wallet.result!, { points: 120 })
      assert.equal(walletUpdate.status.code, ErrorCode.Success)
      assert.isFalse(walletUpdate.status.error)
      assert.exists(walletUpdate.result)
      const walletRead = await walletService.readOne(wallet.result!)
      assert.equal(walletRead.status.code, ErrorCode.Success)
      assert.isFalse(walletRead.status.error)
      assert.exists(walletRead.result)
      assert.equal(walletRead.result?.points, 120)
    })
    it("Should delete a wallet", async function () {
      const wallet = await walletService.create({ points: 100 })
      const walletDelete = await walletService.delete(wallet.result!)
      assert.equal(walletDelete.status.code, ErrorCode.Success)
      assert.isFalse(walletDelete.status.error)
      assert.exists(walletDelete.result)
      const walletRead = await walletService.readOne(wallet.result!)
      assert.equal(walletRead.status.code, ErrorCode.NotFound)
      assert.isTrue(walletRead.status.error)
    })

    it("Read Wallet SRN", async function () {
      const wallet = await walletService.create({ points: 100 })
      const walletRead = await walletService.readOne(wallet.result!)
      assert.equal(walletRead.status.code, ErrorCode.Success)
      assert.isFalse(walletRead.status.error)
      assert.exists(walletRead.result)
      assert.equal(walletRead.result?.points, 100)
      assert.equal(walletRead.result?.srn, `srn::Example:wallet:userWallet::${wallet.result}`)
    })
  })
}