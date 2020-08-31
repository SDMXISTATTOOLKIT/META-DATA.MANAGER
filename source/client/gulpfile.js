const gulp = require('gulp');
const scan = require('i18next-scanner');

const srcDir = "./src";
const jsonExportDir = "./exportedLocales";
const jsonImportDir = "./public/static/locales";

gulp.task('loc-export', () =>
  gulp
    .src([`${srcDir}/**/*.js*`])
    .pipe(scan({
      lngs: ['it', 'en'], // TODO: recuperare configurazione dalla BL
      resource: {
        loadPath: `${jsonImportDir}/{{lng}}/translation.json`,
        savePath: `{{lng}}/translation.json`
      },
      func: {
        list: ['t']
      },
      removeUnusedKeys: true
    }))
    .pipe(gulp.dest(jsonExportDir))
);

gulp.task('loc-import', () =>
  gulp
    .src([`${jsonExportDir}/**/*.json`])
    .pipe(gulp.dest(jsonImportDir))
);
