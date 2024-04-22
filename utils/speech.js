import sdk from "microsoft-cognitiveservices-speech-sdk";

export const generateVoice = function (text, filename) {
  const audioFile = `public/voices/${filename}.wav`;
  // This example requires environment variables named "SPEECH_KEY" and "SPEECH_REGION"
  const speechConfig = sdk.SpeechConfig.fromSubscription(process.env.SPEECH_KEY, process.env.SPEECH_REGION);
  const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioFile);

  // The language of the voice that speaks.
  speechConfig.speechSynthesisVoiceName = "ja-JP-ShioriNeural";

  // Create the speech synthesizer.
  var synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

  // Start the synthesizer and wait for a result.
  synthesizer.speakTextAsync(text,
    function (result) {
      if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
        console.log("synthesis finished.");
      } else {
        console.error("Speech synthesis canceled, " + result.errorDetails +
          "\nDid you set the speech resource key and region values?");
      }
      synthesizer.close();
      synthesizer = null;
    },
    function (err) {
      console.trace("err - " + err);
      synthesizer.close();
      synthesizer = null;
    });
  console.log("Now synthesizing to: " + audioFile);
};