# Firestore Rules Draft

For MVP demo only. Review before production.

```js
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /reports/{reportId} {
      allow read: if true;

      allow create: if request.resource.data.keys().hasOnly([
        'title',
        'description',
        'cleanedSummary',
        'category',
        'severity',
        'safetyLevel',
        'locationText',
        'status',
        'duplicateKey',
        'responsibleTeam',
        'recommendedAction',
        'citizenReply',
        'supportCount',
        'helpOffers',
        'needsHumanReview',
        'insufficientInfo',
        'safetyDisclaimerRequired',
        'createdAt',
        'updatedAt',
        'activity'
      ])
      && request.resource.data.description is string
      && request.resource.data.description.size() <= 2000
      && request.resource.data.status == 'open';

      // For MVP, prefer status updates through server/Admin SDK.
      allow update, delete: if false;
    }

    match /neighborhoodBriefs/{briefId} {
      allow read: if true;
      allow write: if false;
    }

    match /auditLogs/{logId} {
      allow read, write: if false;
    }
  }
}
```

## Production improvements

- Require Firebase Auth.
- Add App Check.
- Add admin custom claims.
- Add rate limiting.
- Hide sensitive locations.
