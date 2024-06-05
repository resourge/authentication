# [@resourge/react-authentication-v1.12.4](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.12.3...@resourge/react-authentication-v1.12.4) (2024-06-05)


### Bug Fixes

* **authenticationprovider:** fix gettoken not working correctly ([5fb7f3c](https://github.com/resourge/authentication/commit/5fb7f3c4178581fc0bd20f7a6e43ebc1452fcb78))

# [@resourge/react-authentication-v1.12.3](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.12.2...@resourge/react-authentication-v1.12.3) (2024-05-23)


### Bug Fixes

* **authenticationprovider:** fix loosing token when not using useSuspense ([2d6faec](https://github.com/resourge/authentication/commit/2d6faec49d58e436b28f2615e53244995eeb9804))

# [@resourge/react-authentication-v1.12.2](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.12.1...@resourge/react-authentication-v1.12.2) (2024-05-22)


### Bug Fixes

* **usepreventmultiple:** remove preventOnUseEffect ([f9dc2e9](https://github.com/resourge/authentication/commit/f9dc2e99792140c5977c30efbaf41edeb484394d))

# [@resourge/react-authentication-v1.12.1](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.12.0...@resourge/react-authentication-v1.12.1) (2024-05-22)


### Bug Fixes

* **authenticationprovider:** fix getToken not working as intended ([adf4958](https://github.com/resourge/authentication/commit/adf49589fc523750f3b425eef640e3e468bbab8b))

# [@resourge/react-authentication-v1.12.0](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.11.0...@resourge/react-authentication-v1.12.0) (2024-05-22)


### Features

* **authenticationprovider:** add getToken to replace onToken ([347a1dc](https://github.com/resourge/authentication/commit/347a1dcc25494bd33c61bcefec4f89fcd2b7ad4a))

# [@resourge/react-authentication-v1.11.0](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.10.4...@resourge/react-authentication-v1.11.0) (2024-05-20)


### Features

* **authenticationprovider:** only refreshToken is it has internet ([478bd90](https://github.com/resourge/authentication/commit/478bd9057ceeed90ed6c71de99c7b89d1104faed))

# [@resourge/react-authentication-v1.10.4](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.10.3...@resourge/react-authentication-v1.10.4) (2024-05-14)


### Bug Fixes

* **authenticationprovider:** fix useSuspense false bugging sometimes ([79a95dd](https://github.com/resourge/authentication/commit/79a95dd14d730bb6055cac8ac706257451ac0f72))

# [@resourge/react-authentication-v1.10.3](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.10.2...@resourge/react-authentication-v1.10.3) (2024-05-10)


### Bug Fixes

* **setupauthentication:** prioritize getProfile token over storage ([c86051f](https://github.com/resourge/authentication/commit/c86051f752279d98e1ae5ae4ecd9506db0da650b))

# [@resourge/react-authentication-v1.10.2](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.10.1...@resourge/react-authentication-v1.10.2) (2024-05-02)


### Bug Fixes

* **authenticationprovider:** return refreshToken before component is created ([7f3abce](https://github.com/resourge/authentication/commit/7f3abce7819673de9b7828bb4c0eb2b50eb9ec13))

# [@resourge/react-authentication-v1.10.1](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.10.0...@resourge/react-authentication-v1.10.1) (2024-05-02)


### Bug Fixes

* **package:** add jwt-decode to dependencies ([859556b](https://github.com/resourge/authentication/commit/859556ba1e5dff31526bbbe5d078c99e40acbc6c))

# [@resourge/react-authentication-v1.10.0](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.9.0...@resourge/react-authentication-v1.10.0) (2024-04-24)


### Features

* **authentication:** improve authentication, with auto token refresh and docs ([79c7a44](https://github.com/resourge/authentication/commit/79c7a4465e5cf557ee0095953a45d309e7e78507))

# [@resourge/react-authentication-v1.9.0](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.8.5...@resourge/react-authentication-v1.9.0) (2024-03-25)


### Features

* **usestorageevent:** add storage eventlistener and fix for mobile ([65f4ae1](https://github.com/resourge/authentication/commit/65f4ae1175f514ede651c8ba5050ba975601a905))

# [@resourge/react-authentication-v1.8.5](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.8.4...@resourge/react-authentication-v1.8.5) (2023-11-07)


### Bug Fixes

* **setupauthentication:** fix authentication token not being correct after a refreshtoken ([1fb8b62](https://github.com/resourge/authentication/commit/1fb8b62b8257b0a23dac423507aa987b043fe3d5))

# [@resourge/react-authentication-v1.8.4](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.8.3...@resourge/react-authentication-v1.8.4) (2023-11-06)


### Bug Fixes

* **authenticationprovider:** fix refreshtoken not updating refreshtoken ([5f304e4](https://github.com/resourge/authentication/commit/5f304e4f01bb2bda2ba09862495d43d10555b51c))

# [@resourge/react-authentication-v1.8.3](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.8.2...@resourge/react-authentication-v1.8.3) (2023-11-03)


### Bug Fixes

* **authenticationprovider:** remove tokens from storage after refreshtoken fail ([4b22c89](https://github.com/resourge/authentication/commit/4b22c89a4c4677f98d920f2348a042be7f03d857))

# [@resourge/react-authentication-v1.8.2](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.8.1...@resourge/react-authentication-v1.8.2) (2023-11-03)


### Bug Fixes

* **authenticationprovider:** add user to previous commit ([f12a1f5](https://github.com/resourge/authentication/commit/f12a1f53def53928d1b2d5a6715d037f29618549))
* **authenticationprovider:** await render after login, for navigation to pages that require session ([0016a0e](https://github.com/resourge/authentication/commit/0016a0e47fae5a62a8b86df6d3f4b377902e6530))

# [@resourge/react-authentication-v1.8.1](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.8.0...@resourge/react-authentication-v1.8.1) (2023-11-03)


### Bug Fixes

* **sessionservice:** fix sessionService not working when setupAuthentication fails first ([19e8a1a](https://github.com/resourge/authentication/commit/19e8a1a49dd352f9d31abc1180c7d26bc1ab3e89))

# [@resourge/react-authentication-v1.8.0](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.7.0...@resourge/react-authentication-v1.8.0) (2023-10-30)


### Features

* **authenticationprovider:** prevent the same function being called multiple times ([96423ee](https://github.com/resourge/authentication/commit/96423ee127349b9634b860561bbdaa774144779f))

# [@resourge/react-authentication-v1.7.0](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.6.3...@resourge/react-authentication-v1.7.0) (2023-10-30)


### Features

* **setupauthentication:** add token and refreshtoken to authentication ([196fb59](https://github.com/resourge/authentication/commit/196fb59e9200497b7af3e322cf8c4211071949c9))

# [@resourge/react-authentication-v1.6.3](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.6.2...@resourge/react-authentication-v1.6.3) (2023-10-27)


### Bug Fixes

* **authenticationprovider:** fix not saving the current token in localStorage ([6232e19](https://github.com/resourge/authentication/commit/6232e19d87b65051fde3f99a1f6f6036201bb913))

# [@resourge/react-authentication-v1.6.2](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.6.1...@resourge/react-authentication-v1.6.2) (2023-10-27)


### Bug Fixes

* **authenticationprovider:** fix login not working as intended ([87372a3](https://github.com/resourge/authentication/commit/87372a30b9ac3b42c5d40ddb4663677853a70426))

# [@resourge/react-authentication-v1.6.1](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.6.0...@resourge/react-authentication-v1.6.1) (2023-10-27)


### Bug Fixes

* **authenticationprovider:** add token to onLogout ([4033c67](https://github.com/resourge/authentication/commit/4033c672646e7b9bd4f0dd9310259635e8028aa4))

# [@resourge/react-authentication-v1.6.0](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.5.2...@resourge/react-authentication-v1.6.0) (2023-10-27)


### Features

* **authentication:** simplify the process ([2d1fa04](https://github.com/resourge/authentication/commit/2d1fa04533dba4340abe7bbbf411cf6bf3e426cc))

# [@resourge/react-authentication-v1.5.2](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.5.1...@resourge/react-authentication-v1.5.2) (2023-10-27)


### Bug Fixes

* **authenticationprovider:** save refrehstoken on storag ([e3af867](https://github.com/resourge/authentication/commit/e3af867b557030e2df68c5830c33d11501f79d03))

# [@resourge/react-authentication-v1.5.1](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.5.0...@resourge/react-authentication-v1.5.1) (2023-10-27)


### Bug Fixes

* **setupauthentication:** setupAuthenticationType make generic params optional ([e6f65a6](https://github.com/resourge/authentication/commit/e6f65a69e40c8a81047de1282a9b14c20247e618))

# [@resourge/react-authentication-v1.5.0](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.4.0...@resourge/react-authentication-v1.5.0) (2023-10-27)


### Bug Fixes

* **authenticationprovider:** on login if refreshToken is return prioritize that over authentication ([f419583](https://github.com/resourge/authentication/commit/f419583536ac381511b8430fbb0c54c2581693e5))
* **index:** remove removed types from export ([c9d8e07](https://github.com/resourge/authentication/commit/c9d8e0705c34dad5236811015f52b0bf5ce7aa6e))


### Features

* **authenticationsystem:** add refreshtoken to system ([385f2b2](https://github.com/resourge/authentication/commit/385f2b2d3e5657a2fc45c88aee856bbab65e8283))

# [@resourge/react-authentication-v1.4.0](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.3.2...@resourge/react-authentication-v1.4.0) (2023-10-27)


### Features

* **authenticationprovider:** return if login was succefully or not ([8394ff7](https://github.com/resourge/authentication/commit/8394ff700794c91d2c755db6bcc98e6ac7a850d8))

# [@resourge/react-authentication-v1.3.2](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.3.1...@resourge/react-authentication-v1.3.2) (2023-10-03)


### Bug Fixes

* **authenticationprovider:** make setUser always create a new instance of User ([e6028f2](https://github.com/resourge/authentication/commit/e6028f2094f20ab05ea62c91d674a60d83ca3ed1))

# [@resourge/react-authentication-v1.3.1](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.3.0...@resourge/react-authentication-v1.3.1) (2023-10-03)


### Bug Fixes

* **authenticationprovider:** let developer change user or permissions without token being mandatory ([40edcd0](https://github.com/resourge/authentication/commit/40edcd04426b864aea36378b1798257b2bf987d8))

# [@resourge/react-authentication-v1.3.0](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.2.1...@resourge/react-authentication-v1.3.0) (2023-10-03)


### Features

* **authenticationprovider:** add setUser to manually update user ([cfdbc70](https://github.com/resourge/authentication/commit/cfdbc705affb686ae1e3dbab5864307f8940ca54))

# [@resourge/react-authentication-v1.2.1](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.2.0...@resourge/react-authentication-v1.2.1) (2023-09-18)


### Bug Fixes

* **authenticationprovider:** fix wrong variavel ([9a06916](https://github.com/resourge/authentication/commit/9a069165a914ee227bb31cfdeaf4f9723ac30320))

# [@resourge/react-authentication-v1.2.0](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.1.0...@resourge/react-authentication-v1.2.0) (2023-09-18)


### Features

* **authenticationprovider:** add user and permission to onToken ([995a859](https://github.com/resourge/authentication/commit/995a859419eedd95bb30b37995a015af34df1fd6))

# [@resourge/react-authentication-v1.1.0](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.0.3...@resourge/react-authentication-v1.1.0) (2023-07-25)


### Features

* **errorboundary:** redirect on error ([5c3dd6b](https://github.com/resourge/authentication/commit/5c3dd6b71453eac01a12595598c6e9b0b08e4237))

# [@resourge/react-authentication-v1.0.3](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.0.2...@resourge/react-authentication-v1.0.3) (2023-07-12)


### Bug Fixes

* **authentication provider:** trigger onlogout before removing token ([d049a82](https://github.com/resourge/authentication/commit/d049a824621b8dba4513383d4741469e5688303e))

# [@resourge/react-authentication-v1.0.2](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.0.1...@resourge/react-authentication-v1.0.2) (2023-06-12)


### Bug Fixes

* **authenticationsystem:** fix loadingComponent type not accepting Element components ([460b088](https://github.com/resourge/authentication/commit/460b0881c5d348c041481c66f059d8c779646a07))

# [@resourge/react-authentication-v1.0.1](https://github.com/resourge/authentication/compare/@resourge/react-authentication-v1.0.0...@resourge/react-authentication-v1.0.1) (2023-06-12)


### Bug Fixes

* **project:** fix SetupAuthenticationType and fix imports ([11207a0](https://github.com/resourge/authentication/commit/11207a0c85fcc31a9fb3dcafd2cdc019483060e9))

# @resourge/react-authentication-v1.0.0 (2023-06-07)


### Features

* **project:** first commit ([34b11d0](https://github.com/resourge/authentication/commit/34b11d0cc147e3a33758a328cea455b42357e9de))

# [@resourge/react-translations-v1.6.3](https://github.com/resourge/translations/compare/@resourge/react-translations-v1.6.2...@resourge/react-translations-v1.6.3) (2023-05-09)


### Bug Fixes

* **utils:** export utils ([a869a2c](https://github.com/resourge/translations/commit/a869a2cccfcf8fa379cfddb6faeed771155d38b9))

# [@resourge/react-translations-v1.6.2](https://github.com/resourge/translations/compare/@resourge/react-translations-v1.6.1...@resourge/react-translations-v1.6.2) (2023-05-09)


### Bug Fixes

* **t:** fix t type ([7653ca5](https://github.com/resourge/translations/commit/7653ca5a9f796acf0fe30a46c6cbd402e9103b09))

# [@resourge/react-translations-v1.6.1](https://github.com/resourge/translations/compare/@resourge/react-translations-v1.6.0...@resourge/react-translations-v1.6.1) (2023-05-09)


### Bug Fixes

* **keystructure:** fix keystructure not working as expected ([10a07d5](https://github.com/resourge/translations/commit/10a07d52f9834679bdf9ede1fe633eb8d33e50c5))

# [@resourge/react-translations-v1.6.0](https://github.com/resourge/translations/compare/@resourge/react-translations-v1.5.1...@resourge/react-translations-v1.6.0) (2023-05-08)


### Bug Fixes

* **maptranslations and trans:** fix not returning key when value doesnt exist ([e0078f6](https://github.com/resourge/translations/commit/e0078f697ad2227a73063c79d917d86d41f92c8e))


### Features

* **trans:** add Trans component to include html elements ([e42bab3](https://github.com/resourge/translations/commit/e42bab38fb1f4a4f781e6c3187b09137c065966d))

# [@resourge/react-translations-v1.5.1](https://github.com/resourge/translations/compare/@resourge/react-translations-v1.5.0...@resourge/react-translations-v1.5.1) (2023-05-08)


### Bug Fixes

* **types:** fix translation types ([843e576](https://github.com/resourge/translations/commit/843e57620f3464d97463f46f4d0cba0d4041985b))

# [@resourge/react-translations-v1.5.0](https://github.com/resourge/translations/compare/@resourge/react-translations-v1.4.0...@resourge/react-translations-v1.5.0) (2023-05-04)


### Features

* **project:** new version ([055ed68](https://github.com/resourge/translations/commit/055ed681c1fc173e8b9d18c9dd85033811583668))

# [@resourge/react-translations-v1.1.0](https://github.com/resourge/translations/compare/@resourge/react-translations-v1.0.0...@resourge/react-translations-v1.1.0) (2023-05-04)


### Features

* **project:** force new and same version ([b2ca080](https://github.com/resourge/translations/commit/b2ca08070e16ce73d03385c21fc9ae3eef15e1eb))

# @resourge/react-translations-v1.0.0 (2023-05-04)


### Bug Fixes

* **package json:** fix command line build ([1988ad3](https://github.com/resourge/translations/commit/1988ad3a67baa7e363afac161417fd8e1a0521d9))
* **project:** publish react-translations ([314432d](https://github.com/resourge/translations/commit/314432d92881bd7418cf94c8400d5a23f03b8a2c))


### Features

* **project:** first Commit ([39cd542](https://github.com/resourge/translations/commit/39cd542cb9b481958b4e0cccabb624871eedc268))
