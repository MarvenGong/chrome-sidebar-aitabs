module.exports = {
  parser: '@typescript-eslint/parser',
  // parser: 'vue-eslint-parser',
  root: true,
  env: {
    node: true
  },
  plugins: ['vue'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-essential',
    'plugin:vue/vue3-recommended',
    '@vue/eslint-config-prettier'
  ],
  rules: {
    'eslintvue/multi-word-component-names': 'off', // 关闭多单词组件名称规则
    'vue/singleline-html-element-content-newline': 0,
    'vue/max-attributes-per-line': [
      'warn',
      {
        singleline: {
          max: 4
        },
        multiline: {
          max: 2
        }
      }
    ],
    'max-len': [
      'error',
      {
        code: 120,
        tabWidth: 2,
        comments: 140,
        ignorePattern: '^import\\s|\\b(require|from)\\b',
        ignoreComments: false,
        ignoreTrailingComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true
      }
    ],
    'object-curly-newline': 2,
    '@typescript-eslint/no-this-alias': ['off'],
    '@typescript-eslint/no-explicit-any': 0,
    'vue/html-self-closing': 0,
    'vue/no-v-html': 1,
    'vue/multi-word-component-names': 1,
    'no-multiple-template-root': 0,
    'vue/component-name-in-template-casing': ['error', 'kebab-case'],
    'no-plusplus': 0,

    // 重新覆盖 extends: 'standard'的规则
    'comma-dangle': ['error', 'never'],
    // 自定义的规则
    'linebreak-style': 2,
    // indent: ['error', 2], // error类型，缩进2个空格---使用prettier的
    'space-before-function-paren': 0, // 在函数左括号的前面是否有空格
    'eol-last': 0, // 不检测新文件末尾是否有空行
    semi: ['error', 'always'], // 必须在语句后面加分号
    // 'quotes': ['error', 'double'],// 字符串没有使用单引号
    'no-console': ['error', { allow: ['log', 'warn'] }], // 允许使用console.log()
    // 'no-unused-vars': [1, { vars: 'all', args: 'after-used' }], // 不能有声明后未被使用的变量或参数
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    'no-underscore-dangle': 2, // 标识符不能以_开头或结尾
    'arrow-parens': 0,
    'no-new': 0, // 允许使用 new 关键字
    quotes: [2, 'single'], // 单引号
    'no-debugger': 2, // 禁用debugger
    'no-var': 0, // 对var警告
    'no-irregular-whitespace': 0, // 不规则的空白不允许
    'no-trailing-spaces': 2, // 一行结束后面有空格就发出警告
    'no-alert': 1, // 禁止使用alert confirm prompt
    'no-lone-blocks': 0, // 禁止不必要的嵌套块
    'no-class-assign': 2, // 禁止给类赋值
    'no-cond-assign': 2, // 禁止在条件表达式中使用赋值语句
    'no-const-assign': 2, // 禁止修改const声明的变量
    'no-delete-var': 2, // 不能对var声明的变量使用delete操作符
    'no-dupe-keys': 2, // 在创建对象字面量时不允许键重复
    'no-duplicate-case': 2, // switch中的case标签不能重复
    'no-dupe-args': 2, // 函数参数不能重复
    'no-empty': 2, // 块语句中的内容不能为空
    'no-func-assign': 2, // 禁止重复的函数声明
    'no-invalid-this': 0, // 禁止无效的this，只能用在构造器，类，对象字面量
    'no-redeclare': 2, // 禁止重复声明变量
    'no-spaced-func': 1, // 函数调用时 函数名与()之间不能有空格 --- 用ts的规则，否则类型声明中会报错
    'no-this-before-super': 0, // 在调用super()之前不能使用this或super
    'no-undef': 2, // 不能有未定义的变量
    'no-use-before-define': 2, // 未定义前不能使用
    camelcase: 0, // 强制驼峰法命名
    'jsx-quotes': [2, 'prefer-double'], // 强制在JSX属性（jsx-quotes）中一致使用双引号
    'no-extra-boolean-cast': 0, // 禁止不必要的bool转换
    'no-unreachable': 1, // 不能有无法执行的代码
    'no-mixed-spaces-and-tabs': 0, // 禁止混用tab和空格
    'prefer-arrow-callback': 0, // 比较喜欢箭头回调
    'arrow-spacing': 0, //= >的前/后括号
    '@typescript-eslint/ban-ts-comment': 0,
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-var-requires': 0
  },
  globals: {
    Hammer: true,
    QRCode: true,
    chrome: true
  },
  overrides: [
    {
      files: ['*.vue'],
      parser: 'vue-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
        extraFileExtensions: ['.vue'],
        ecmaVersion: 'latest',
        ecmaFeatures: {
          jsx: true
        }
      },
      rules: {
        'no-undef': 'off'
      }
    }
  ]
};
