declare module 'sao' {
  import { Question, Answers } from 'inquirer'
  import * as fs from 'fs-extra'
  import * as ora from 'ora'
  import * as chalk from 'chalk'

  export interface TemplateData {
    [key: string]: any
  }

  export interface Prompt<T extends Answers = Answers> extends Question<T> {
    name: Extract<keyof T, string>,
    type?: 'input' | 'number' | 'confirm' | 'list' | 'rawlist' | 'expand' | 'checkbox' | 'password' | 'editor',
    /**
     * This is a property only for SAO, it is used to store user inputs so that SAO can use stored value as default value the next time. Note that different version of a generator stores the inputs in different places.
     *
     * @default false
     */
    store?: boolean,
  }

  type Prompts<T extends Answers = Answers> = Array<Prompt<T>>

  export interface Generator<T extends Answers = Answers> {
    /**
     * The answers of prompts.
     * When you access it in prompts, it will be `undefined`.
     */
    answers: T,
    /**
     * The global configuration of the git user.
     */
    gitUser: {
      name?: string,
      username?: string,
      email?: string,
    },
    /**
     * The absolute path to output directory.
     */
    outDir: string,
    /**
     * The folder name of output directory.
     */
    outFolder: string,
    /**
     * The npm client.
     */
    npmClient: 'npm' | 'yarn',
    fs: typeof fs,
    spinner: ora.Ora,
    chalk: (typeof chalk)['default'],
    logger: Record<
      'debug' | 'warn' | 'error' | 'success' | 'tip' | 'info',
      (...args: any[]) => void
    >,
    /**
     * Run git init synchonously in output directory.
     */
    gitInit: () => void,
    /**
     * Use `npm` or `yarn` to install packages in output directory.
     */
    npmInstall: (opts?: {
      cwd?: string,
      /**
       * The packages to install, if omited, it will install packages in `package.json`.
       */
      packages?: string[],
      /**
       * Install packages as devDependencies.
       *
       * @default false
       */
      saveDev?: boolean,
    }) => Promise<void>,
    /**
     * Display a message for successful project creation.
     */
    showProjectTips: () => void,
  }

  export interface GeneratorConfig<T extends Answers = Answers> {
    /**
     * Executed before prompts and actions, you can throw an error here to exit the process.
     */
    prepare?: (this: Generator<T>) => Promise<void>,
    /**
     * Executed when all actions are completed.
     */
    completed?: (this: Generator<T>) => Promise<void>,
    /**
     * The working directory for file action.
     *
     * @default 'template'
     */
    templateDir?: string,
    /**
     * The extra data you can access in template files.
     */
    templateData?: Record<string, any> | ((this: Generator<T>) => Record<string, any>),
    /**
     * Sub generators.
     */
    subGenerators?: Array<{
      /**
       * Generator name.
       */
      name: string,
      /**
       * A path to the generator, relative to the `saofile.js`.
       */
      generator: string,
    }>,
    /**
     * `prompts` is a list of questions you want the user to answer.
     */
    prompts?: (this: Generator<T>) => Prompts<T>,
    /**
     * `actions` is used to manipulate files.
     */
    actions?: (this: Generator<T>) => Array<{
      /**
       * Add files from template directory to target directory.
       */
      type: 'add',
      /**
       * One or more glob patterns, files are resolved relative to `templateDir`.
       */
      files: string | string[],
      /**
       * Enable/Disable transformer.
       *
       * @default true
       */
      transform?: boolean,
      /**
       * One or more glob patterns, transform specific files with the transformer.
       */
      transformInclude?: string | string[],
      /**
       * One or more glob patterns, **DON'T** transform specific files with the transformer.
       */
      transformExclude?: string | string[],
      /**
       * Exclude some files from being added.
       */
      filters?: Record<string, boolean>,
      /**
       * The working directory for file action.
       *
       * @default 'template'
       */
      templateDir?: string,
      /**
       * The extra data you can access in template files.
       */
      templateData?: Record<string, any> | ((this: Generator<T>) => Record<string, any>),
    } | {
      /**
       * Modify files in target directory.
       */
      type: 'modify',
      /**
       * One or more glob patterns.
       */
      files: string | string[],
      /**
       * The function we use to get new file contents.
       *
       * For `.json` we automatically parse and stringify it.
       *
       * Otherwise you will recieve raw string.
       */
      handler: (data: any, filePath: string) => any,
    } | {
      /**
       * Move files in target directory.
       */
      type: 'move',
      /**
       * Each entry can be a glob pattern which is supposed to matches zero or one file in target directory.
       */
      patterns: Record<string, string>,
    } | {
      /**
       * Remove files in target directory.
       */
      type: 'remove',
      /**
       * One or more glob patterns to match the files that should be removed.
       */
      files: string | string[],
      when?: (answers: Answers) => boolean,
    }>,
  }
}
