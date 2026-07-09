 const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET.trim(),
      callbackURL: process.env.GOOGLE_CALLBACK_URL.trim()
    },

    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;

        // Check existing google user
        let user = await User.findOne({
          providerId: profile.id
        });

        if (!user) {
          // Check if same email already exists
          user = await User.findOne({
            email: email
          });

          if (user) {
            user.provider = 'google';
            user.providerId = profile.id;
            user.isVerified = true;
            await user.save();
          } else {
            user = await User.create({
              name: profile.displayName,
              email: email,
              provider: 'google',
              providerId: profile.id,
              avatar: profile.photos?.[0]?.value || '',
              isVerified: true
            });
          }
        }

        return done(null, user);

      } catch (error) {
        console.log("Google Auth Error:", error);
        return done(error, null);
      }
    }
  )
);


passport.serializeUser((user, done) => {
  done(null, user.id);
});


passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});


module.exports = passport;