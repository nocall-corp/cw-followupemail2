/**
 * CW Follow-up Email Automation 2
 * nocall.aiからのWebhookを受信して、職歴提出状況と目標達成度による4パターンのメール送信制御
 */

const CONFIG = {
  senderEmail: 'crowdworks@nocall.ai',
  senderName: 'クラウドワークス エージェント テック本部事務局',
  replyTo: 'crowdworks@nocall.ai',
  ccEmails: [
    'career-crowdtech@crowdtech.jp',
    'marie.terao@crowdworks.co.jp',
    'ittetsu.yao@crowdworks.co.jp'
  ],
  emailSubject: '【ご面談の件について】（クラウドワークステック事務局）'
};

//

/**
 * Webhook受信処理のエントリーポイント
 */
function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    
    if (!isValidPayload(payload)) {
      
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Invalid payload'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    processWebhook(payload);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Webhook processed successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * ペイロードの妥当性をチェック
 */
function isValidPayload(payload) {
  return payload && 
         payload.callStatus === 'completed' && 
         payload.endUser && 
         payload.endUser.attributions && 
         payload.endUser.attributions['メールアドレス'] &&
         payload.conversation;
}

/**
 * Webhook処理とメール送信制御ロジック
 */
function processWebhook(payload) {
  try {
    const endUser = payload.endUser;
    const conversation = payload.conversation;
    const attributions = endUser.attributions;
    const agent = payload.agent || {};
    
    // 必要な情報を取得
    const userEmail = attributions['メールアドレス'];
    const userName = attributions['名'] || 'お客様';
    const goalStatus = conversation.goalStatus;
    const goalResult = conversation.goalResult || '';
    const agentId = agent.id;
    const agentName = agent.name;
    
    // agent.id が 430 以外はメール送信処理をスキップ
    if (agentId !== 430) {
      return;
    }
    
    // fujiwara@gmail.comへのメール送信をブロック
    if (userEmail && userEmail.toLowerCase().includes('fujiwara@gmail.com')) {
      return;
    }
    
    // shokureki（職歴提出状況）の判定
    const shokureki = determineShokurekiStatus(attributions);
    
    // 4パターンのメール送信制御
    let shouldSendEmail = false;
    let templateType = '';
    
    if (shokureki === '未提出' && goalStatus === 'achieved') {
      shouldSendEmail = true;
      templateType = 'standard';
    } else if (shokureki === '未提出' && goalStatus !== 'achieved') {
      shouldSendEmail = true;
      templateType = 'unsubmitted';
    } else if (shokureki === '提出済み' && goalStatus === 'achieved') {
      shouldSendEmail = true;
      templateType = 'submitted';
    } else if (shokureki === '提出済み' && goalStatus !== 'achieved') {
      shouldSendEmail = false;
    }
    
    
    if (shouldSendEmail) {
      sendFollowUpEmail(userEmail, userName, goalResult, templateType);
    } else {
    }
    
  } catch (error) {
    throw error;
  }
}

/**
 * 職歴提出状況を判定
 * attributions['shokureki'] の値のみで判定する
 */
function determineShokurekiStatus(attributions) {
  try {
    
    const raw = String(attributions['shokureki'] || '').trim();

    if (/提出済み|済|完了/.test(raw)) {
      return '提出済み';
    }
    if (/未提出|未/.test(raw)) {
      return '未提出';
    }

    // キーが無い、または判定できなければ未提出
    return '未提出';
  } catch (error) {
    return '未提出';
  }
}

/**
 * パーソナライズされたフォローアップメール送信
 */
function sendFollowUpEmail(userEmail, userName, goalResult, templateType) {
  try {
    
    const emailTemplate = getEmailTemplate(templateType);
    const emailBody = replaceTemplatePlaceholders(emailTemplate, userName, goalResult);
    
    // templateTypeに応じて件名を設定
    let subject = CONFIG.emailSubject;
    if (templateType === 'unsubmitted') {
      subject = '【職務経歴書ご提出のお願い】（クラウドワークステック事務局）';
    }
    
    const mailOptions = {
      to: userEmail,
      cc: CONFIG.ccEmails.join(','),
      replyTo: CONFIG.replyTo,
      subject: subject,
      htmlBody: emailBody.replace(/\n/g, '<br>')
    };
    GmailApp.sendEmail(
      userEmail,
      subject,
      '',
      {
        htmlBody: mailOptions.htmlBody,
        cc: mailOptions.cc,
        replyTo: mailOptions.replyTo,
        name: CONFIG.senderName
      }
    );
  } catch (error) {
    throw error;
  }
}

/**
 * 条件に応じたテンプレート選択
 */
function getEmailTemplate(templateType) {
  try {
    let templateContent = '';
    
    switch (templateType) {
      case 'standard':
        templateContent = getTemplateContent('emailContents');
        break;
      case 'unsubmitted':
        templateContent = getTemplateContent('emailContentsUnsubmitted');
        break;
      case 'submitted':
        templateContent = getTemplateContent('emailContentdSubmitted');
        break;
      default:
        throw new Error(`Unknown template type: ${templateType}`);
    }
    
    return templateContent;
    
  } catch (error) {
    throw error;
  }
}

/**
 * テンプレートファイルからコンテンツを取得
 */
function getTemplateContent(templateName) {
  try {
    // Google Apps Scriptではファイルを直接読み込めないため、
    // テンプレートを文字列として定義
    const templates = {
      'emailContents': `お世話になっております。クラウドワークステック事務局です。
先ほどはお電話でのご対応をありがとうございました。

面談の件について、下記の通り確定いたしました。
・日時：{確定日時}
・所要時間：15分程度
・形式：面談

また、より詳細な職歴情報をお伺いして、{user_name}様のご経歴に合う案件をご紹介したく、
下記リンクより職歴情報のご提出をお願いいたします。

https://tech.crowdworks.jp/login

【ご参考資料】
・職務経歴書の雛形
https://docs.google.com/spreadsheets/d/1MHjrtCri89VyMaXv1aIQiiYnAWBOJvYm/edit?usp=sharing&ouid=100120649335527564769&rtpof=true&sd=true

何かご不明点がございましたら、お気軽にお問い合わせください。

------------------------------------------------------
株式会社クラウドワークス
クラウドワークス エージェント テック本部事務局
（旧クラウドテック事務局）
MAIL：salesassistant-technology@crowdtech.jp

営業時間：10:00-19:00
営業日：月～金（土日祝除く）
※案件のご質問に関しましては順番にお応え致しますので、メールにてご連絡頂けますと幸いです。
※ご返信をいただく際は、＜全員返信＞をお願いいたします。
------------------------------------------------------`,

      'emailContentsUnsubmitted': `お世話になっております。クラウドワークステック事務局です。
先ほどはお電話でのご対応をありがとうございました。

また、より詳細な職歴情報をお伺いして、{user_name}様のご経歴に合う案件をご紹介したく、
下記リンクより職歴情報のご提出をお願いいたします。

https://tech.crowdworks.jp/login

【ご参考資料】
・職務経歴書の雛形
https://docs.google.com/spreadsheets/d/1MHjrtCri89VyMaXv1aIQiiYnAWBOJvYm/edit?usp=sharing&ouid=100120649335527564769&rtpof=true&sd=true

何かご不明点がございましたら、お気軽にお問い合わせください。

ご入力が完了いたしましたらご紹介に向けて対応を進めてまいりますので
何卒よろしくお願い申し上げます。

------------------------------------------------------
株式会社クラウドワークス
クラウドワークス エージェント テック本部事務局
（旧クラウドテック事務局）
MAIL：salesassistant-technology@crowdtech.jp

営業時間：10:00-19:00
営業日：月～金（土日祝除く）
※案件のご質問に関しましては順番にお応え致しますので、メールにてご連絡頂けますと幸いです。
※ご返信をいただく際は、＜全員返信＞をお願いいたします。
------------------------------------------------------`,

      'emailContentdSubmitted': `お世話になっております。クラウドワークステック事務局です。
先ほどはお電話でのご対応をありがとうございました。

面談の件について、下記の通り確定いたしました。
・日時：{確定日時}
・所要時間：15分程度
・形式：面談

何かご不明点がございましたら、お気軽にお問い合わせください。

------------------------------------------------------
株式会社クラウドワークス
クラウドワークス エージェント テック本部事務局
（旧クラウドテック事務局）
MAIL：salesassistant-technology@crowdtech.jp

営業時間：10:00-19:00
営業日：月～金（土日祝除く）
※案件のご質問に関しましては順番にお応え致しますので、メールにてご連絡頂けますと幸いです。
※ご返信をいただく際は、＜全員返信＞をお願いいたします。
------------------------------------------------------`
    };
    
    return templates[templateName] || '';
    
  } catch (error) {
    throw error;
  }
}

/**
 * 動的コンテンツ置換
 */
function replaceTemplatePlaceholders(template, userName, goalResult) {
  try {
    let result = template;
    
    // ユーザー名の置換
    result = result.replace(/{user_name}/g, userName);
    
    // 確定日時の置換（goalResultをそのまま使用）
    result = result.replace(/{確定日時}/g, goalResult);
    
    return result;
    
  } catch (error) {
    throw error;
  }
}

/**
 * テスト用Webhook処理関数
 */
function testWebhook() {
  const testPayload = {
    "id": "call_test_123",
    "timestamp": "2025-01-23T15:45:05.24+09:00",
    "callStatus": "completed",
    "from": "+815012345678",
    "to": "+819098765432",
    "endUser": {
      "id": "end_user_test_123",
      "phoneNumber": "+819098765432",
      "attributions": {
        "姓": "林",
        "名": "翔吾",
        "セイ": "ハヤシ",
        "メイ": "ショウゴ",
        "会社名": "テスト株式会社",
        "メールアドレス": "hayashi@nocall.ai"
      }
    },
    "conversation": {
      "messages": [],
      "startTime": "2025-01-23T15:40:05.24+09:00",
      "endTime": "2025-01-23T15:45:05.24+09:00",
      "duration": 300000,
      "goalStatus": "achieved",
      "goalResult": "2025年1月24日(金) 14:00から面談を実施します。"
    },
    "agent": {
      "id": 430,
      "name": "即時架電"
    }
  };
  
  processWebhook(testPayload);
}

/**
 * テスト用メール送信関数
 */
function testSimpleEmail() {
  sendFollowUpEmail(
    'hayashi@nocall.ai',
    '林翔吾',
    '2025年1月24日(金) 14:00から面談を実施します。',
    'standard'
  );
}

