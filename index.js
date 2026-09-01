const express = require("express");
const mongoose = require("mongoose");
const app = express();
const fs = require('fs');
const path = require("path");
const cors = require("cors");
const config = require("./config");

//socket io
const http = require("http");
const httpsServer = http.createServer(app);
const io = require("socket.io")(httpsServer);

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
app.use("/storage", express.static(path.join(__dirname, "storage")));

// method
const { offlineUser } = require("./server/user/user.controller");

// model
const Wallet = require("./server/wallet/wallet.model");
const User = require("./server/user/user.model");
const Follower = require("./server/follower/follower.model");
const LiveUser = require("./server/liveUser/liveUser.model");
const Chat = require("./server/chat/chat.model");
const ChatTopic = require("./server/chatTopic/chatTopic.model");
const LiveStreamingHistory = require("./server/liveStreamingHistory/liveStreamingHistory.model");

//FCM node
var FCM = require("fcm-node");
var fcm = new FCM(config.SERVER_KEY);

//admin route
const AdminRoute = require("./server/admin/admin.route");
app.use("/admin", AdminRoute);

//banner route
const BannerRoute = require("./server/banner/banner.route");
app.use("/banner", BannerRoute);

//coinPlan route
const CoinPlanRoute = require("./server/coinPlan/coinPlan.route");
app.use("/coinPlan", CoinPlanRoute);

//vipPlan route
const VIPPlanRoute = require("./server/vipPlan/vipPlan.route");
app.use("/vipPlan", VIPPlanRoute);

//gift category route
const GiftCategoryRoute = require("./server/giftCategory/giftCategory.route");
app.use("/giftCategory", GiftCategoryRoute);

//gift route
const GiftRoute = require("./server/gift/gift.route");
app.use("/gift", GiftRoute);

//user route
const UserRoute = require("./server/user/user.route");
app.use("/", UserRoute);

//follower route
const FollowerRoute = require("./server/follower/follower.route");
app.use("/", FollowerRoute);

//location route
const LocationRoute = require("./server/location/location.route");
app.use("/location", LocationRoute);

//song route
const SongRoute = require("./server/song/song.route");
app.use("/song", SongRoute);

//hashtag route
const HashtagRoute = require("./server/hashtag/hashtag.route");
app.use("/hashtag", HashtagRoute);

//level route
const LevelRoute = require("./server/level/level.route");
app.use("/level", LevelRoute);

//post route
const PostRoute = require("./server/post/post.route");
app.use("/", PostRoute);

//video route
const VideoRoute = require("./server/video/video.route");
app.use("/", VideoRoute);

//favorite route
const FavoriteRoute = require("./server/favorite/favorite.route");
app.use("/", FavoriteRoute);

//comment route
const CommentRoute = require("./server/comment/comment.route");
app.use("/comment", CommentRoute);

//setting route
const SettingRoute = require("./server/setting/setting.route");
app.use("/setting", SettingRoute);

//complain route
const ComplainRoute = require("./server/complain/complain.route");
app.use("/complain", ComplainRoute);

//advertisement route
const AdvertisementRoute = require("./server/advertisement/advertisement.route");
app.use("/advertisement", AdvertisementRoute);

// redeem route
const RedeemRoute = require("./server/redeem/redeem.route");
app.use("/redeem", RedeemRoute);

// wallet route
const WalletRoute = require("./server/wallet/wallet.route");
app.use("/", WalletRoute);

// live user route
const LiveUserRoute = require("./server/liveUser/liveUser.route");
app.use("/", LiveUserRoute);

// live streaming history route
const LiveStreamingHistoryRoute = require("./server/liveStreamingHistory/liveStreamingHistory.route");
app.use("/", LiveStreamingHistoryRoute);

// chat topic route
const ChatTopicRoute = require("./server/chatTopic/chatTopic.route");
app.use("/", ChatTopicRoute);

// chat route
const ChatRoute = require("./server/chat/chat.route");
app.use("/", ChatRoute);

// notification route
const NotificationRoute = require("./server/notification/notification.route");
app.use("/", NotificationRoute);

// dashboard route
const DashboardRoute = require("./server/dashboard/dashboard.route");
app.use("/dashboard", DashboardRoute);

// report route
const ReportRoute = require("./server/report/report.route");
app.use("/report", ReportRoute);

// sticker route
const StickerRoute = require("./server/sticker/sticker.route");
app.use("/sticker", StickerRoute);

//public index.html file
app.get("/*", function (req, res) {
  res.status(200).sendFile(path.join(__dirname, "public", "index.html"));
});

//mongodb connection
mongoose.connect(
  `mongodb+srv://zarytech665_db_user:REIccjWZagnLtzlu@cluster0.1mwjw5l.mongodb.net/zorona?appName=Cluster0`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("MONGO: successfully connected to db");
});

// socket io
io.on("connect", (socket) => {
  console.log("Connection done");
  //The moment one of your client connected to socket.io server it will obtain socket id
  //Let's print this out.

  // liveRoom and liveHostRoom for live streaming
  let liveRoom;
  // this room for getting end time of live streaming
  let liveHostRoom;

  console.log("socket Query", socket.handshake.query);

  const live = socket.handshake.query.obj
    ? JSON.parse(socket.handshake.query.obj)
    : null;

  if (live !== null) {
    liveRoom = live.liveRoom;
    liveHostRoom = live.liveHostRoom;
  }

  console.log("Live", live);
  console.log("Live Room excet before Live", liveRoom);

  // chatRoom for chat
  const { chatRoom } = socket.handshake.query;
  console.log("chat room", chatRoom);

  // callRoom, globalRoom and videoCallRoom for one to one call
  const { callRoom } = socket.handshake.query;
  console.log("call room", callRoom);
  // this room for call request to user
  const { globalRoom } = socket.handshake.query;
  // this room is used when two user connect successfully
  const { videoCallRoom } = socket.handshake.query;

  //when user open the app
  const { userRoom } = socket.handshake.query;

  socket.join(liveRoom);
  socket.join(chatRoom);
  socket.join(callRoom);
  socket.join(globalRoom);
  socket.join(videoCallRoom);
  socket.join(liveHostRoom);

  // live streaming socket events
  socket.on("liveStreaming", (data) => {
    console.log("liveStreaming", data);
    console.log("LiveRoom liveStreaming ", liveRoom);

    io.in(liveRoom).emit("liveStreaming", data);
  });
  socket.on("simpleFilter", (data) => {
    console.log("simpleFilter", data);
    console.log("LiveRoom simpleFilter ", liveRoom);
    io.in(liveRoom).emit("simpleFilter", data);
  });
  socket.on("animatedFilter", (data) => {
    console.log("animatedFilter", data);
    console.log("LiveRoom animatedFilter ", liveRoom);
    io.in(liveRoom).emit("animatedFilter", data);
  });
  socket.on("gif", (data) => {
    console.log("gif", data);
    console.log("LiveRoom gif ", liveRoom);
    io.in(liveRoom).emit("gif", data);
  });
  socket.on("comment", async (data) => {
    // const data = JSON.parse(data_);
    console.log("comment", data);
    console.log("LiveRoom comment ", liveRoom);
    const liveStreamingHistory = await LiveStreamingHistory.findById(
      data.liveStreamingId
    );

    console.log("liveStreamingHistory", liveStreamingHistory);
    if (liveStreamingHistory) {
      liveStreamingHistory.comments += 1;
      await liveStreamingHistory.save();
    }
    io.in(liveRoom).emit("comment", data);
  });
  // live user send gift during live streaming [put entry on outgoing collection]
  socket.on("liveUserGift", async (data) => {
    console.log("liveUserGift", data);
    console.log("LiveRoom liveUserGift ", liveRoom);

    const user = await User.findById(data.userId).populate("level");
    console.log("liveUserGift user", user);
    if (user && data.coin < user.diamond) {
      user.diamond -= data.coin;
      user.spentCoin += data.coin;
      await user.save();

      // if type=0 && otherUserId=null then gift sent by user during live streaming
      const outgoing = new Wallet();
      outgoing.userId = user._id;
      outgoing.diamond = data.coin;
      outgoing.type = 0;
      outgoing.isIncome = false;
      outgoing.otherUserId = null;
      outgoing.date = new Date().toLocaleString();
      await outgoing.save();
    }
    io.in(liveRoom).emit("gift", data, null, user);
  });
  // normal user send gift during live streaming [put entry on income and outgoing collection]
  socket.on("normalUserGift", async (data) => {
    console.log("normalUserGift", data);
    console.log("LiveRoom normalUserGift ", liveRoom);

    const senderUser = await User.findById(data.senderUserId).populate("level");
    const receiverUser = await User.findById(data.receiverUserId).populate(
      "level"
    );

    if (senderUser && receiverUser && data.coin < senderUser.diamond) {
      senderUser.diamond -= data.coin;
      senderUser.spentCoin += data.coin;
      await senderUser.save();

      console.log("senderUser in Gift send", senderUser);

      const outgoing = new Wallet();
      outgoing.userId = senderUser._id;
      outgoing.diamond = data.coin;
      outgoing.type = 0;
      outgoing.isIncome = false;
      outgoing.otherUserId = receiverUser._id;
      outgoing.date = new Date().toLocaleString();
      await outgoing.save();

      receiverUser.rCoin += data.coin;
      await receiverUser.save();

      const liveUser = await LiveUser.findOne({ liveUserId: receiverUser._id });
      liveUser.rCoin += data.coin;
      await liveUser.save();

      console.log("updated liveUser in gift send", liveUser);

      console.log("receiverUser in Gift send", receiverUser);

      const income = new Wallet();
      income.userId = receiverUser._id;
      income.rCoin = data.coin;
      income.type = 0;
      income.isIncome = true;
      income.otherUserId = senderUser._id;
      income.date = new Date().toLocaleString();
      await income.save();
    }

    const liveStreamingHistory = await LiveStreamingHistory.findById(
      data.liveStreamingId
    );
    if (liveStreamingHistory) {
      liveStreamingHistory.rCoin += data.coin;
      liveStreamingHistory.gifts += 1;
      liveStreamingHistory.endTime = new Date().toLocaleString();
      await liveStreamingHistory.save();
    }

    console.log("gift response in position 2", senderUser);
    io.in(liveRoom).emit("gift", data, senderUser, receiverUser);
    // io.in(liveRoom).emit("gift", receiverUser);
  });
  socket.on("addView", async (data) => {
    console.log("addView", data);
    console.log("LiveRoom addView ", liveRoom);
    const liveStreamingHistory = await LiveStreamingHistory.findById(
      data.liveStreamingId
    );
    const liveUser = await LiveUser.findById(data.liveUserMongoId);

    console.log(
      "liveUser Id ------------ ID------- in ad view",
      data.liveUserMongoId
    );
    console.log("liveUser in ad view", liveUser);

    if (liveUser) {
      const joinedUserExist = await LiveUser.findOne({
        _id: liveUser._id,
        "view.userId": data.userId,
      });

      if (joinedUserExist) {
        await LiveUser.updateOne(
          { _id: liveUser._id, "view.userId": data.userId },
          {
            $set: {
              "view.$.userId": data.userId,
              "view.$.image": data.image,
              "view.$.isVIP": data.isVIP,
              "view.$.isAdd": true,
            },
          }
        );
      } else {
        liveUser.view.push({
          userId: data.userId,
          image: data.image,
          isVIP: data.isVIP,
          isAdd: true,
        });

        await liveUser.save();
      }
    }

    const _liveUser = await LiveUser.findById(data.liveUserMongoId);

    if (liveStreamingHistory && _liveUser) {
      liveStreamingHistory.user = _liveUser.view.length;
      liveStreamingHistory.endTime = new Date().toLocaleString();
      await liveStreamingHistory.save();
      io.in(liveRoom).emit("view", _liveUser.view);
    }
  });
  socket.on("lessView", async (data) => {
    console.log("lessView", data);
    console.log("LiveRoom lessView ", liveRoom);
    const liveStreamingHistory = await LiveStreamingHistory.findById(
      data.liveStreamingId
    );

    await LiveUser.updateOne(
      { _id: data.liveUserMongoId, "view.userId": data.userId },
      {
        $set: {
          "view.$.isAdd": false,
        },
      }
    );

    const liveUser = await LiveUser.findOne({
      _id: data.liveUserMongoId,
      "view.isAdd": true,
    });

    if (liveStreamingHistory) {
      liveStreamingHistory.endTime = new Date().toLocaleString();
      await liveStreamingHistory.save();
    }
    await io.in(liveRoom).emit("view", liveUser ? liveUser.view : []);
  });
  socket.on("getUserProfile", async (data) => {
    const user = await User.findById(data.toUserId)
      .populate("level")
      .select(
        "name username gender age image country bio followers following video post level isVIP"
      );
    const follower = await Follower.findOne({
      fromUserId: data.fromUserId,
      toUserId: user._id,
    });
    const userData = {
      ...user._doc,
      userId: user._id,
      isFollow: follower ? true : false,
    };
    io.in(liveRoom).emit("getUserProfile", userData);
  });
  socket.on("blockedList", (data) => {
    console.log("blocked data", data);
    console.log("blocked liveRoom", liveRoom);
    io.in(liveRoom).emit("blockedList", data);
  });

  socket.on("pkRequest", async (data) => {
    console.log("pkRequest", data);
    console.log("pkRequest guestHostId", data.GUEST_HOST_ID);
    io.in(data.GUEST_HOST_ID).emit("pkRequest", data);
  });

  socket.on("pkAnswer", async (data) => {
    console.log("pkAnswer", data);
    console.log("pkAnswer mainHostId", data.MAIN_HOST_ID);
    io.in(data.MAIN_HOST_ID).emit("pkAnswer", data);
  });

  // create chat
  socket.on("chat", async (data) => {
    console.log("data in chat", data);
    if (data.messageType === "message") {
      const chatTopic = await ChatTopic.findById(data.topic).populate(
        "receiverUser senderUser"
      );

      console.log("chatTopi in Chat", chatTopic);

      if (chatTopic) {
        const chat = new Chat();
        chat.senderId = data.senderId;
        chat.messageType = "message";
        chat.message = data.message;
        chat.image = null;
        chat.topic = chatTopic._id;
        chat.date = new Date().toLocaleString();

        await chat.save();

        chatTopic.chat = chat._id;
        await chatTopic.save();

        let receiverUser, senderUser;
        if (
          chatTopic.senderUser &&
          chatTopic.senderUser._id.toString() === data.senderId.toString()
        ) {
          receiverUser = chatTopic.receiverUser;
          senderUser = chatTopic.senderUser;
        } else if (chatTopic.receiverUser && chatTopic.receiverUser._id) {
          receiverUser = chatTopic.senderUser;
          senderUser = chatTopic.receiverUser;
        }

        if (
          receiverUser &&
          !receiverUser.isBlock &&
          receiverUser.notification.message
        ) {
          const payload = {
            to: receiverUser.fcmToken,
            notification: {
              body: chat.message,
              title: senderUser.name,
            },
            data: {
              data: {
                topic: chatTopic._id,
                message: chat.message,
                date: chat.date,
                chatDate: chat.date,
                userId: senderUser._id,
                name: senderUser.name,
                username: senderUser.username,
                image: senderUser.image,
                country: senderUser.country,
                isVIP: senderUser.isVIP,
                time: "Just Now",
              },
              type: "MESSAGE",
            },
          };
          await fcm.send(payload, function (err, response) {
            if (err) {
              console.log("Something has gone wrong!", err);
            }
          });
        }
        console.log("chatRoom in chat", chatRoom);
        io.in(chatRoom).emit("chat", chat);
      }
    } else {
      console.log("chatRoom in chat error", chatRoom);
      io.in(chatRoom).emit("chat", data);
    }
  });

  // call
  socket.on("callRequest", (data) => {
    console.log("in callRequest socket", data);
    console.log("call room ^R", callRoom);
    io.in(globalRoom).emit("callRequest", data);
  });
  socket.on("callConfirmed", (data) => {
    console.log("in callConfirmed socket", data);
    console.log("call room ^C", callRoom);
    io.in(callRoom).emit("callConfirmed", data);
  });
  socket.on("callAnswer", (data) => {
    console.log("in callAnswer socket", data);
    console.log("call room ^A", callRoom);
    io.in(callRoom).emit("callAnswer", data);
  });
  socket.on("callReceive", async (data) => {
    const callDetail = await Wallet.findById(data.callId);
    if (callDetail) {
      const user = await User.findById(callDetail.userId).populate("level");

      if (user && user.diamond >= data.coin) {
        user.diamond -= data.coin;
        user.spentCoin += data.coin;
        await user.save();

        callDetail.diamond += data.coin;
        callDetail.callConnect = true;
        callDetail.callStartTime = new Date().toLocaleString();
        callDetail.callEndTime = new Date().toLocaleString();

        await callDetail.save();
        io.in(videoCallRoom).emit("callReceive", user);
      } else {
        io.in(videoCallRoom).emit("callReceive", null, user);
      }
    }
  });
  socket.on("callDisconnect", async (callId) => {
    console.log("Call disconnected", callId);
    const callHistory = await Wallet.findById(callId);
    if (callHistory) {
      callHistory.callEndTime = new Date().toLocaleString();
      await callHistory.save();
    }
  });
  // when user decline the call
  socket.on("callCancel", async (data) => {
    console.log("call Cancelled", data);
    console.log("call Cancelled call Room", callRoom);
    io.in(callRoom).emit("callCancel", data);
  });

  socket.on("disconnect", async () => {
    console.log("disconnect User Done LiveRoom", liveRoom);
    console.log("disconnect User Done LiveHostRoom", liveHostRoom);
    const liveStreamingHistory = await LiveStreamingHistory.findById(liveRoom);
    console.log("liveStreamingHistory", liveStreamingHistory);
    if (liveStreamingHistory) {
      liveStreamingHistory.endTime = new Date().toLocaleString();
      await liveStreamingHistory.save();
    }

    const liveUser = await LiveUser.findOne({ liveUserId: liveHostRoom });
    if (liveUser) {
      await liveUser.deleteOne();
    }

    // TODO: bug
    // const callHistory = await Wallet.findById(callRoom);
    // if (callHistory) {
    //   console.log("callHistory", callHistory);
    //   callHistory.callEndTime = new Date().toLocaleString();
    //   await callHistory.save();
    // }

    await offlineUser(userRoom);
    // console.log("One of sockets disconnected from our server.");
  });
});

// start the server
httpsServer.listen(config.PORT, () => {
  console.log("Magic happens on port " + config.PORT);
});